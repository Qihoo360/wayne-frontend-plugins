import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClrDatagridStateInterface } from '@clr/angular';
import { ConfirmationDialogService } from '../../../src/app/shared/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationMessage } from '../../../src/app/shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../../src/app/shared/shared.const';
import { Subscription } from 'rxjs/Subscription';
import { MessageHandlerService } from '../../../src/app/shared/message-handler/message-handler.service';
import { ListServiceTplComponent } from './list-servicetpl/list-servicetpl.component';
import { CreateEditServiceTplComponent } from './create-edit-servicetpl/create-edit-servicetpl.component';
import { ServiceTpl } from '../../shared/model/servicetpl';
import { ServiceTplService } from '../../shared/client/v1/servicetpl.service';
import { PageState } from '../../../src/app/shared/page/page-state';
import { isNotEmpty } from '../../../src/app/shared/utils';

@Component({
  selector: 'wayne-servicetpl',
  templateUrl: './servicetpl.component.html',
  styleUrls: ['./servicetpl.component.scss']
})
export class ServiceTplComponent implements OnInit, OnDestroy {
  @ViewChild(ListServiceTplComponent, { static: false })
  list: ListServiceTplComponent;
  @ViewChild(CreateEditServiceTplComponent, { static: false })
  createEdit: CreateEditServiceTplComponent;

  pageState: PageState = new PageState({pageSize: 10});
  serviceTpls: ServiceTpl[];
  serviceId: string;
  componentName = '服务模板';

  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private serviceTplService: ServiceTplService,
    private messageHandlerService: MessageHandlerService,
    private deletionDialogService: ConfirmationDialogService) {
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.SERVICE_TPL) {
        const id = message.data;
        this.serviceTplService.deleteById(id, 0)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('服务模版删除成功！');
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
      this.serviceId = params['sid'];
      if (typeof (this.serviceId) === 'undefined') {
        this.serviceId = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  retrieve(state?: ClrDatagridStateInterface): void {
    if (state) {
      this.pageState = PageState.fromState(state, {
        pageSize: 10,
        totalPage: this.pageState.page.totalPage,
        totalCount: this.pageState.page.totalCount
      });
    }
    this.pageState.params['deleted'] = false;
    if (this.route.snapshot.queryParams) {
      Object.getOwnPropertyNames(this.route.snapshot.queryParams).map(key => {
        const value = this.route.snapshot.queryParams[key];
        if (isNotEmpty(value)) {
          this.pageState.filters[key] = value;
        }
      });
    }
    this.serviceTplService.listPage(this.pageState, 0, this.serviceId)
      .subscribe(
        response => {
          const data = response.data;
          this.pageState.page.totalPage = data.totalPage;
          this.pageState.page.totalCount = data.totalCount;
          this.serviceTpls = data.list;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  createServiceTpl(created: boolean) {
    if (created) {
      this.retrieve();
    }
  }

  openModal(): void {
    this.createEdit.newOrEditServiceTpl();
  }

  deleteServiceTpl(serviceTpl: ServiceTpl) {
    const deletionMessage = new ConfirmationMessage(
      '删除服务模版确认',
      '你确认删除服务模版 ' + serviceTpl.name + ' ？',
      serviceTpl.id,
      ConfirmationTargets.SERVICE_TPL,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  editServiceTpl(serviceTpl: ServiceTpl) {
    this.createEdit.newOrEditServiceTpl(serviceTpl.id);
  }
}
