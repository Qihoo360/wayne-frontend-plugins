import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from '../../../src/app/shared/client/v1/breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { State } from '@clr/angular';
import { ConfirmationDialogService } from '../../../src/app/shared/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationMessage } from '../../../src/app/shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../../src/app/shared/shared.const';
import { Subscription } from 'rxjs/Subscription';
import { MessageHandlerService } from '../../../src/app/shared/message-handler/message-handler.service';
import { ListServiceComponent } from './list-service/list-service.component';
import { CreateEditServiceComponent } from './create-edit-service/create-edit-service.component';
import { Service } from '../../shared/model/service';
import { ServiceService } from '../../shared/client/v1/service.service';
import { PageState } from '../../../src/app/shared/page/page-state';

@Component({
  selector: 'wayne-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
  @ViewChild(ListServiceComponent)
  list: ListServiceComponent;
  @ViewChild(CreateEditServiceComponent)
  createEdit: CreateEditServiceComponent;

  pageState: PageState = new PageState();
  services: Service[];
  appId: string;
  componentName = '服务';

  subscription: Subscription;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private messageHandlerService: MessageHandlerService,
    private deletionDialogService: ConfirmationDialogService) {
    breadcrumbService.addFriendlyNameForRoute('/admin/service', this.componentName + '列表');
    breadcrumbService.addFriendlyNameForRoute('/admin/service/trash', '已删除' + this.componentName + '列表');
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.SERVICE) {
        let id = message.data;
        this.serviceService.deleteById(id, 0)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('服务删除成功！');
              this.retrieve();
            },
            error => {
              this.messageHandlerService.handleError(error);
            }
          );
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.appId = params['aid'];
      if (typeof (this.appId) == 'undefined') {
        this.appId = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  retrieve(state?: State): void {
    if (state) {
      this.pageState = PageState.fromState(state, {totalPage: this.pageState.page.totalPage, totalCount: this.pageState.page.totalCount});
    }
    this.serviceService.list(this.pageState, 'false', this.appId)
      .subscribe(
        response => {
          let data = response.data;
          this.pageState.page.totalPage = data.totalPage;
          this.pageState.page.totalCount = data.totalCount;
          this.services = data.list;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  createService(created: boolean) {
    if (created) {
      this.retrieve();
    }
  }

  openModal(): void {
    this.createEdit.newOrEditService();
  }

  deleteService(service: Service) {
    let deletionMessage = new ConfirmationMessage(
      '删除服务确认',
      '你确认删除服务 ' + service.name + ' ？',
      service.id,
      ConfirmationTargets.SERVICE,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  editService(service: Service) {
    this.createEdit.newOrEditService(service.id);
  }
}
