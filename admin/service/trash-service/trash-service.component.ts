import { Component, OnDestroy, OnInit } from '@angular/core';
import { State } from '@clr/angular';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';
import { ConfirmationMessage } from '../../../../src/app/shared/confirmation-dialog/confirmation-message';
import { ConfirmationButtons, ConfirmationState, ConfirmationTargets } from '../../../../src/app/shared/shared.const';
import { ConfirmationDialogService } from '../../../../src/app/shared/confirmation-dialog/confirmation-dialog.service';
import { Subscription } from 'rxjs/Subscription';
import { Service } from '../../../shared/model/service';
import { ServiceService } from '../../../shared/client/v1/service.service';
import { PageState } from '../../../../src/app/shared/page/page-state';
import { AceEditorService } from '../../../../src/app/shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../../src/app/shared/ace-editor/ace-editor';

@Component({
  selector: 'trash-service',
  templateUrl: 'trash-service.component.html'
})
export class TrashServiceComponent implements OnInit, OnDestroy {

  services: Service[];
  pageState: PageState = new PageState();
  currentPage: number = 1;
  state: State;

  subscription: Subscription;

  constructor(private serviceService: ServiceService,
              private messageHandlerService: MessageHandlerService,
              private deletionDialogService: ConfirmationDialogService,
              private aceEditorService: AceEditorService) {
    this.subscription = deletionDialogService.confirmationConfirm$.subscribe(message => {
      if (message &&
        message.state === ConfirmationState.CONFIRMED &&
        message.source === ConfirmationTargets.TRASH_SERVICE) {
        let id = message.data;
        this.serviceService.deleteById(id, 0, false)
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
    this.serviceService.list(this.pageState, 'true')
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

  deleteService(service: Service) {
    let deletionMessage = new ConfirmationMessage(
      '删除服务确认',
      '你确认永久删除服务 ' + service.name + ' ？删除后将不可恢复！',
      service.id,
      ConfirmationTargets.TRASH_SERVICE,
      ConfirmationButtons.DELETE_CANCEL
    );
    this.deletionDialogService.openComfirmDialog(deletionMessage);
  }

  recoverService(service: Service) {
    service.deleted = false;
    this.serviceService
      .update(service)
      .subscribe(
        response => {
          this.messageHandlerService.showSuccess('服务恢复成功！');
          this.refresh();
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  detailMetaDataTpl(tpl: string) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(tpl, false, '元数据查看'));
  }
}
