import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgForm } from '@angular/forms';
import { ActionType } from '../../../../src/app/shared/shared.const';
import { Service } from '../../../shared/model/service';
import { App } from '../../../../src/app/shared/model/v1/app';
import { ServiceService } from '../../../shared/client/v1/service.service';
import { AppService } from '../../../../src/app/shared/client/v1/app.service';
import { AceEditorBoxComponent } from '../../../../src/app/shared/ace-editor/ace-editor-box/ace-editor-box.component';
import { AceEditorService } from '../../../../src/app/shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../../src/app/shared/ace-editor/ace-editor';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';

@Component({
  selector: 'create-edit-service',
  templateUrl: 'create-edit-service.component.html',
  styleUrls: ['create-edit-service.scss']
})
export class CreateEditServiceComponent implements OnInit {
  @Output() create = new EventEmitter<boolean>();
  modalOpened: boolean;

  ngForm: NgForm;
  @ViewChild('ngForm', { static: true })
  currentForm: NgForm;

  @ViewChild(AceEditorBoxComponent, { static: false })
  aceBox: any;

  service: Service = new Service();
  checkOnGoing = false;
  isSubmitOnGoing = false;
  isNameValid = true;

  title: string;
  actionType: ActionType;

  apps: App[];

  constructor(private serviceService: ServiceService,
              private appService: AppService,
              private aceEditorService: AceEditorService,
              private messageHandlerService: MessageHandlerService) {
  }

  ngOnInit(): void {
    this.appService
      .getNames()
      .subscribe(
        response => {
          this.apps = response.data;
        },
        error => this.messageHandlerService.handleError(error)
      );
  }

  newOrEditService(id?: number) {
    this.modalOpened = true;
    if (id) {
      this.actionType = ActionType.EDIT;
      this.title = '编辑服务';
      this.serviceService.getById(id, 0).subscribe(
        status => {
          this.service = status.data;
          this.service.metaDataObj = JSON.parse(this.service.metaData ? this.service.metaData : '{}');
          this.initJsonEditor();
        },
        error => {
          this.messageHandlerService.handleError(error);

        });
    } else {
      this.actionType = ActionType.ADD_NEW;
      this.title = '创建服务';
      this.service = new Service();
      this.service.metaDataObj = {};
      this.initJsonEditor();
    }
  }

  initJsonEditor(): void {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(this.service.metaDataObj));
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
    this.service.metaData = this.aceBox.getValue();
    switch (this.actionType) {
      case ActionType.ADD_NEW:
        this.serviceService.create(this.service).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('创建服务成功！');
          },
          error => {
            this.isSubmitOnGoing = false;
            this.modalOpened = false;
            this.messageHandlerService.handleError(error);

          }
        );
        break;
      case ActionType.EDIT:
        this.serviceService.update(this.service).subscribe(
          status => {
            this.isSubmitOnGoing = false;
            this.create.emit(true);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('更新服务成功！');
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
      this.isNameValid &&
      !this.checkOnGoing;
  }

  // Handle the form validation
  handleValidation(): void {
    const cont = this.currentForm.controls['name'];
    if (cont) {
      this.isNameValid = cont.valid;
    }

  }

}

