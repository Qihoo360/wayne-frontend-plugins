import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { State } from '@clr/angular';
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

@Component({
  selector: 'wayne-servicetpl',
  templateUrl: './servicetpl.component.html',
  styleUrls: ['./servicetpl.component.scss']
})
export class ServiceTplComponent implements OnInit {
  @ViewChild(ListServiceTplComponent)
  list: ListServiceTplComponent;
  @ViewChild(CreateEditServiceTplComponent)
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
        let id = message.data;
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
      if (typeof (this.serviceId) == 'undefined') {
        this.serviceId = '';
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
      this.pageState = PageState.fromState(state, {
        pageSize: 10,
        totalPage: this.pageState.page.totalPage,
        totalCount: this.pageState.page.totalCount
      });
    }
    this.pageState.params['deleted'] = false;
    this.serviceTplService.listPage(this.pageState, 0, this.serviceId)
      .subscribe(
        response => {
          let data = response.data;
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
    let deletionMessage = new ConfirmationMessage(
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
