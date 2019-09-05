import { AfterContentInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClrDatagridStateInterface } from '@clr/angular';
import {
  ConfirmationButtons,
  ConfirmationState,
  ConfirmationTargets,
  httpStatusCode,
  KubeResourceService,
  PublishType,
  syncStatusInterval,
  TemplateState
} from '../../../src/app/shared/shared.const';
import { MessageHandlerService } from '../../../src/app/shared/message-handler/message-handler.service';
import { ListServiceComponent } from './list-service/list-service.component';
import { CreateEditServiceComponent } from './create-edit-service/create-edit-service.component';
import { combineLatest } from 'rxjs';
import { AppService } from '../../../src/app/shared/client/v1/app.service';
import { App } from '../../../src/app/shared/model/v1/app';
import { CacheService } from '../../../src/app/shared/auth/cache.service';
import { ClusterService } from '../../../src/app/shared/client/v1/cluster.service';
import { Cluster } from '../../../src/app/shared/model/v1/cluster';
import { AuthService } from '../../../src/app/shared/auth/auth.service';
import { PublishService } from '../../../src/app/shared/client/v1/publish.service';
import { PublishStatus } from '../../../src/app/shared/model/v1/publish-status';
import { ConfirmationMessage } from '../../../src/app/shared/confirmation-dialog/confirmation-message';
import { ConfirmationDialogService } from '../../../src/app/shared/confirmation-dialog/confirmation-dialog.service';
import { Subscription } from 'rxjs/Subscription';
import { isArrayNotEmpty, isNotEmpty } from '../../../src/app/shared/utils';
import { PageState } from '../../../src/app/shared/page/page-state';
import { TabDragService } from '../../../src/app/shared/client/v1/tab-drag.service';
import { OrderItem } from '../../../src/app/shared/model/v1/order';
import { Service } from '../../shared/model/service';
import { ServiceTpl } from '../../shared/model/servicetpl';
import { ServiceClient } from '../../shared/client/v1/kubernetes/service';
import { ServiceService } from '../../shared/client/v1/service.service';
import { PublishHistoryService } from '../../../src/app/portal/common/publish-history/publish-history.service';
import { ServiceTplService } from '../../shared/client/v1/servicetpl.service';
import { KubeService } from '../../shared/model/kubernetes/service';
import { KubernetesClient } from '../../../src/app/shared/client/v1/kubernetes/kubernetes';

const showState = {
  'create_time': {hidden: false},
  '端口号': {hidden: false},
  '上线机房': {hidden: false},
  '发布说明': {hidden: false},
  '创建者': {hidden: false},
  '操作': {hidden: false}
};

@Component({
  selector: 'wayne-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements AfterContentInit, OnInit, OnDestroy {
  @ViewChild(ListServiceComponent, { static: false })
  list: ListServiceComponent;
  @ViewChild(CreateEditServiceComponent, { static: false })
  createEdit: CreateEditServiceComponent;
  serviceId: number;
  pageState: PageState = new PageState();
  isOnline = false;
  services: Service[];
  serviceTpls: ServiceTpl[];
  app: App;
  appId: number;
  clusters: Cluster[];
  timer: any = null;
  tplStatusMap = {};
  publishStatus: PublishStatus[];
  subscription: Subscription;
  tabScription: Subscription;
  orderCache: Array<OrderItem>;
  showList: any[] = new Array();
  showState: object = showState;
  leave = false;


  constructor(private route: ActivatedRoute,
              private router: Router,
              private publishService: PublishService,
              public cacheService: CacheService,
              private appService: AppService,
              public authService: AuthService,
              private clusterService: ClusterService,
              private deletionDialogService: ConfirmationDialogService,
              private serviceClient: ServiceClient,
              private kubernetesClient: KubernetesClient,
              private serviceService: ServiceService,
              private publishHistoryService: PublishHistoryService,
              private tabDragService: TabDragService,
              private el: ElementRef,
              private serviceTplService: ServiceTplService,
              private messageHandlerService: MessageHandlerService) {
    this.tabScription = this.tabDragService.tabDragOverObservable.subscribe(over => {
      if (over) {
        this.tabChange();
      }
    });
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.SERVICE) {
        const serviceId = message.data;
        this.serviceService.deleteById(serviceId, this.app.id)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('负载均衡删除成功！');
              this.serviceId = null;
              this.initService(true);
            },
            error => {
              this.messageHandlerService.handleError(error);
            }
          );
      }
    });
    this.periodSyncStatus();
  }

  ngOnInit() {
    this.initShow();
  }

  initShow() {
    this.showList = [];
    Object.keys(this.showState).forEach(key => {
      if (!this.showState[key].hidden) {
        this.showList.push(key);
      }
    });
  }

  diffTpl() {
    this.list.diffTpl();
  }

  confirmEvent() {
    Object.keys(this.showState).forEach(key => {
      if (this.showList.indexOf(key) > -1) {
        this.showState[key] = {hidden: false};
      } else {
        this.showState[key] = {hidden: true};
      }
    });
  }

  cancelEvent() {
    this.initShow();
  }

  tabChange() {
    const orderList = [].slice.call(this.el.nativeElement.querySelectorAll('.tabs-item')).map((item, index) => {
      return {
        id: parseInt(item.id, 10),
        order: index
      };
    });
    if (this.orderCache && JSON.stringify(this.orderCache) === JSON.stringify(orderList)) {
      return;
    }
    this.serviceService.updateOrder(this.appId, orderList).subscribe(
      response => {
        if (response.data === 'ok!') {
          this.initOrder();
          this.messageHandlerService.showSuccess('排序成功');
        }
      },
      error => {
        this.messageHandlerService.handleError(error);
      }
    );
  }

  initOrder(deployments?: Service[]) {
    if (deployments) {
      this.orderCache = deployments.map(item => {
        return {
          id: item.id,
          order: item.order
        };
      });
    } else {
      this.orderCache = [].slice.call(this.el.nativeElement.querySelectorAll('.tabs-item')).map((item, index) => {
        return {
          id: parseInt(item.id, 10),
          order: index
        };
      });
    }
  }

  periodSyncStatus() {
    this.timer = setInterval(() => {
      this.syncStatus();
    }, syncStatusInterval);
  }

  syncStatus(): void {
    if (this.serviceTpls && this.serviceTpls.length > 0) {
      for (let i = 0; i < this.serviceTpls.length; i++) {
        const tpl = this.serviceTpls[i];
        if (tpl.status && tpl.status.length > 0) {
          for (let j = 0; j < tpl.status.length; j++) {
            const status = tpl.status[j];
            if (status.errNum > 2) {
              continue;
            }
            this.kubernetesClient.get(status.cluster, KubeResourceService, tpl.name, this.cacheService.kubeNamespace,
              this.appId.toString()).subscribe(
              response => {
                const code = response.statusCode || response.status;
                if (code === httpStatusCode.NoContent) {
                  this.serviceTpls[i].status[j].state = TemplateState.NOT_FOUND;
                  return;
                }
                if (response.data &&
                  this.serviceTpls &&
                  this.serviceTpls[i] &&
                  this.serviceTpls[i].status &&
                  this.serviceTpls[i].status[j]) {
                  this.serviceTpls[i].status[j].state = TemplateState.SUCCESS;
                } else {
                  this.serviceTpls[i].status[j].state = TemplateState.FAILD;
                }
              },
              error => {
                if (this.serviceTpls &&
                  this.serviceTpls[i] &&
                  this.serviceTpls[i].status &&
                  this.serviceTpls[i].status[j]) {
                  this.serviceTpls[i].status[j].errNum += 1;
                  this.messageHandlerService.showError(`${status.cluster}请求错误次数 ${this.serviceTpls[i].status[j].errNum} 次`);
                  if (this.serviceTpls[i].status[j].errNum === 3) {
                    this.messageHandlerService.showError(`${status.cluster}的错误请求已经停止，请联系管理员解决`);
                  }
                }
                console.log(error);
              }
            );
          }
        }
      }
    }
  }

  ngAfterContentInit() {
    this.initService();
  }

  get selectedServiceCluster() {
    if (isNotEmpty(this.serviceId) && isArrayNotEmpty(this.services)) {
      for (const svc of this.services) {
        if (this.serviceId === svc.id) {
          try {
            const metaData = JSON.parse(svc.metaData);
            if (metaData.clusters) {
              return metaData.clusters;
            }
          } catch (e) {
            return null;
          }
        }
      }
    }
    return null;
  }

  initService(refreshTpl?: boolean) {
    this.appId = this.route.parent.snapshot.params['id'];
    const namespaceId = this.cacheService.namespaceId;
    this.serviceId = parseInt(this.route.snapshot.params['serviceId'], 10);
    combineLatest(
      [this.serviceService.list(new PageState({pageSize: 50}), 'false', this.appId.toString()),
      this.appService.getById(this.appId, namespaceId),
      this.clusterService.getNames()]
    ).subscribe(
      response => {
        this.services = response[0].data.list.sort((a, b) => a.order - b.order);
        this.initOrder(this.services);
        this.serviceId = this.getServiceId(this.serviceId);
        this.app = response[1].data;
        this.clusters = response[2].data;
        if (refreshTpl) {
          this.retrieve();
        }
      },
      error => {
        this.messageHandlerService.handleError(error);
      }
    );
  }

  getServiceId(serviceId: number): number {
    if (this.services && this.services.length > 0) {
      if (!serviceId) {
        return this.services[0].id;
      }
      for (const svc of this.services) {
        if (serviceId === svc.id) {
          return serviceId;
        }
      }
      return this.services[0].id;
    } else {
      return null;
    }
  }

  publishHistory() {
    this.publishHistoryService.openModal(PublishType.SERVICE, this.serviceId);
  }

  tabClick(id: number) {
    if (id) {
      this.serviceId = id;
      this.retrieve();
    }
  }

  cloneServiceTpl(tpl: ServiceTpl) {
    if (tpl) {
      this.router.navigate(
        [`portal/namespace/${this.cacheService.namespaceId}/app/${this.app.id}/service/${this.serviceId}/tpl/${tpl.id}`]);
    }

  }

  createServiceTpl() {
    this.router.navigate([`portal/namespace/${this.cacheService.namespaceId}/app/${this.app.id}/service/${this.serviceId}/tpl`]);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.leave = true;
    this.subscription.unsubscribe();
    this.tabScription.unsubscribe();
  }

  onlineChange() {
    this.retrieve();
  }

  retrieve(state?: ClrDatagridStateInterface): void {
    if (!this.serviceId) {
      return;
    }
    if (state) {
      this.pageState = PageState.fromState(state, {totalPage: this.pageState.page.totalPage, totalCount: this.pageState.page.totalCount});
    }
    this.pageState.params['deleted'] = false;
    this.pageState.params['isOnline'] = this.isOnline;
    combineLatest(
      [this.serviceTplService.listPage(this.pageState, this.app.id, this.serviceId.toString()),
      this.publishService.listStatus(PublishType.SERVICE, this.serviceId)]
    ).subscribe(
      response => {
        const status = response[1].data;
        this.publishStatus = status;
        const tplStatusMap = {};
        if (status && status.length > 0) {
          for (const st of status) {
            if (!tplStatusMap[st.templateId]) {
              tplStatusMap[st.templateId] = Array<PublishStatus>();
            }
            st.errNum = 0;
            tplStatusMap[st.templateId].push(st);
          }
        }
        this.tplStatusMap = tplStatusMap;

        const tpls = response[0].data;
        this.pageState.page.totalPage = tpls.totalPage;
        this.pageState.page.totalCount = tpls.totalCount;
        this.serviceTpls = this.buildTplList(tpls.list);
        setTimeout(() => {
          if (this.leave) {
            return;
          }
          this.syncStatus();
        });
      },
      error => this.messageHandlerService.handleError(error)
    );
  }

  buildTplList(tpls: ServiceTpl[]): ServiceTpl[] {
    if (tpls && tpls.length > 0) {
      for (let i = 0; i < tpls.length; i++) {
        const service: KubeService = JSON.parse(tpls[i].template);
        if (service.spec.ports && service.spec.ports.length > 0) {
          const ports = Array<string>();
          for (const port of  service.spec.ports) {
            ports.push(`${port.port}:${port.targetPort}/${port.protocol}`);
          }
          tpls[i].ports = ports.join(', ');

          const publishStatus = this.tplStatusMap[tpls[i].id];
          if (publishStatus && publishStatus.length > 0) {
            tpls[i].status = publishStatus;
          }
        }
      }
    }
    return tpls;
  }

  deleteService() {
    if (this.publishStatus && this.publishStatus.length > 0) {
      this.messageHandlerService.warning('已上线负载均衡无法删除，请先下线负载均衡！');
    } else {
      const deletionMessage = new ConfirmationMessage(
        '删除负载均衡确认',
        '是否确认删除负载均衡?',
        this.serviceId,
        ConfirmationTargets.SERVICE,
        ConfirmationButtons.DELETE_CANCEL
      );
      this.deletionDialogService.openComfirmDialog(deletionMessage);
    }
  }

  createService(id: number) {
    if (id) {
      this.serviceId = null;
      this.initService(true);
    }
  }

  openModal(): void {
    this.createEdit.newOrEditResource(this.app, this.filterCluster());
  }



  editService() {
    this.createEdit.newOrEditResource(this.app, this.filterCluster(), this.serviceId);
  }

  filterCluster(): Cluster[] {
    return this.clusters.filter((clusterObj: Cluster) => {
      return this.cacheService.namespace.metaDataObj.clusterMeta &&
        this.cacheService.namespace.metaDataObj.clusterMeta[clusterObj.name];
    });
  }

}
