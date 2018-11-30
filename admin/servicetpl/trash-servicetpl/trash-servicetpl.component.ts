import { Component, OnDestroy, OnInit } from '@angular/core';
import { State } from '@clr/angular';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';
import { ConfirmationMessage } from '../../../../src/app/shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../../../src/app/shared/shared.const';
import { ConfirmationDialogService } from '../../../../src/app/shared/confirmation-dialog/confirmation-dialog.service';
import { Subscription } from 'rxjs/Subscription';
import { ServiceTpl } from '../../../shared/model/servicetpl';
import { ServiceTplService } from '../../../shared/client/v1/servicetpl.service';
import { AceEditorService } from '../../../../src/app/shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../../src/app/shared/ace-editor/ace-editor';
import { PageState } from '../../../../src/app/shared/page/page-state';

@Component({
  selector: 'trash-servicetpl',
  templateUrl: 'trash-servicetpl.component.html'
})
export class TrashServiceTplComponent implements OnInit, OnDestroy {

  serviceTpls: ServiceTpl[];
  pageState: PageState = new PageState();
  currentPage: number = 1;
  state: State;

  subscription: Subscription;

  constructor(private serviceTplService: ServiceTplService,
              private messageHandlerService: MessageHandlerService,
              private deletionDialogService: ConfirmationDialogService,
              private aceEditorService: AceEditorService) {
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.TRASH_SERVICE_TPL) {
        let id = message.data;
        this.serviceTplService
          .deleteById(id, 0, false)
          .subscribe(
            response => {
              this.messageHandlerService.showSuccess('服务删除成功！');
              this.refresh();
            },
            error => {
              this.messageHandlerService.handleError(error);
            }
          );
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  pageSizeChange(pageSize: number) {
    this.state.page.to = pageSize - 1;
    this.state.page.size = pageSize;
    this.currentPage = 1;
    this.refresh(this.state);
  }

  refresh(state?: State) {
    if (state) {
      this.state = state;
      this.pageState = PageState.fromState(state, {totalPage: this.pageState.page.totalPage, totalCount: this.pageState.page.totalCount});
    }
    this.pageState.params['deleted'] = true;
    this.serviceTplService.listPage(this.pageState, 0)
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

  deleteServiceTpl(serviceTpl: ServiceTpl) {
    let deletionMessage = new ConfirmationMessage(
      '删除服务确认',
      '你确认永久删除服务模版 ' + serviceTpl.name + ' ？删除后将不可恢复！',
      serviceTpl.id,
      ConfirmationTargets.TRASH_SERVICE_TPL,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  tplDetail(serviceTpl: ServiceTpl) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(serviceTpl.template, false, '详情'));
  }

  recoverServiceTpl(serviceTpl: ServiceTpl) {
    serviceTpl.deleted = false;
    this.serviceTplService.update(serviceTpl, 0)
      .subscribe(
        response => {
          this.messageHandlerService.showSuccess('服务模版恢复成功！');
          this.refresh();
        },
        error => this.messageHandlerService.handleError(error)
      );
  }
}
