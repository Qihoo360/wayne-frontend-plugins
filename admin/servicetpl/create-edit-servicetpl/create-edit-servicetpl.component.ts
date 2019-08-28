import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgForm } from '@angular/forms';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';
import { ActionType } from '../../../../src/app/shared/shared.const';
import { isUndefined } from 'util';
import { ServiceTpl } from '../../../shared/model/servicetpl';
import { Service } from '../../../shared/model/service';
import { ServiceTplService } from '../../../shared/client/v1/servicetpl.service';
import { ServiceService } from '../../../shared/client/v1/service.service';
import { AceEditorBoxComponent } from '../../../../src/app/shared/ace-editor/ace-editor-box/ace-editor-box.component';
import { AceEditorService } from '../../../../src/app/shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../../src/app/shared/ace-editor/ace-editor';

@Component({
  selector: 'create-edit-servicetpl',
  templateUrl: 'create-edit-servicetpl.component.html',
  styleUrls: ['create-edit-servicetpl.scss']
})
export class CreateEditServiceTplComponent implements OnInit {
  @Output() create = new EventEmitter<boolean>();
  modalOpened: boolean;

  ngForm: NgForm;
  @ViewChild('ngForm', { static: true })
  currentForm: NgForm;

  serviceTpl: ServiceTpl = new ServiceTpl();
  checkOnGoing = false;
  isSubmitOnGoing = false;

  title: string;
  actionType: ActionType;

  services: Service[];

  @ViewChild(AceEditorBoxComponent, { static: false }) aceBox: any;

  constructor(private serviceTplService: ServiceTplService,
              private serviceService: ServiceService,
              private messageHandlerService: MessageHandlerService,
              private aceEditorService: AceEditorService) {
  }

  ngOnInit(): void {
    this.serviceService.getNames().subscribe(
      response => {
        this.services = response.data;
      },
      error => this.messageHandlerService.handleError(error)
    );
  }

  initJsonEditor(): void {
    let json = {};
    if (this.serviceTpl && this.serviceTpl.template) {
      json = JSON.parse(this.serviceTpl.template);
    }
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(json));
  }

  newOrEditServiceTpl(id?: number) {
    this.modalOpened = true;
    if (id) {
      this.actionType = ActionType.EDIT;
      this.title = '编辑服务模版';
      this.serviceTplService.getById(id, 0).subscribe(
        status => {
          this.serviceTpl = status.data;
          this.initJsonEditor();
        },
        error => {
          this.messageHandlerService.handleError(error);

        });
    } else {
      this.actionType = ActionType.ADD_NEW;
      this.title = '创建服务模版';
      this.serviceTpl = new ServiceTpl();
      this.initJsonEditor();
    }
  }

  onCancel() {
    this.modalOpened = false;
    this.currentForm.reset();
  }

  onSubmit() {
    if (this.isSubmitOnGoing) {
      return;
    }
    this.isSubmitOnGoing = true;
    if (!this.aceBox.isValid) {
      alert('语法有误，请检查！');
      this.isSubmitOnGoing = false;
      return;
    }
    this.serviceTpl.template = this.aceBox.getValue();
    for (const service of this.services) {
      if (service.id === this.serviceTpl.serviceId) {
        this.serviceTpl.name = service.name;
      }
    }
    switch (this.actionType) {
      case ActionType.ADD_NEW:
        this.serviceTplService.create(this.serviceTpl, 0).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('创建服务模版成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
      case ActionType.EDIT:
        this.serviceTplService.update(this.serviceTpl, 0).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('更新服务模版成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
    }
  }

  public get isValid(): boolean {
    return this.currentForm &&
      this.currentForm.valid &&
      !this.isSubmitOnGoing &&
      !this.checkOnGoing &&
      !isUndefined(this.serviceTpl.serviceId);
  }


}

