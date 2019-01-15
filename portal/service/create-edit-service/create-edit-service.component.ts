import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgForm } from '@angular/forms';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';
import { ActionType, configKeyApiNameGenerateRule } from '../../../../src/app/shared/shared.const';
import { App } from '../../../../src/app/shared/model/v1/app';
import { Cluster } from '../../../../src/app/shared/model/v1/cluster';
import { AuthService } from '../../../../src/app/shared/auth/auth.service';
import { ApiNameGenerateRule } from '../../../../src/app/shared/utils';
import { Service } from '../../../shared/model/service';
import { ServiceService } from '../../../shared/client/v1/service.service';

@Component({
  selector: 'create-edit-service',
  templateUrl: 'create-edit-service.component.html',
  styleUrls: ['create-edit-service.scss']
})
export class CreateEditServiceComponent implements OnInit {
  @Output() create = new EventEmitter<number>();
  modalOpened: boolean;

  ngForm: NgForm;
  @ViewChild('ngForm')
  currentForm: NgForm;

  service: Service = new Service();
  checkOnGoing = false;
  isSubmitOnGoing = false;
  isNameValid = true;
  title: string;
  actionType: ActionType;
  app: App;
  clusters = Array<Cluster>();

  constructor(private serviceService: ServiceService,
              private authService: AuthService,
              private messageHandlerService: MessageHandlerService) {
  }

  ngOnInit(): void {

  }

  newOrEditService(app: App, clusters: Cluster[], id?: number) {
    this.modalOpened = true;
    this.app = app;
    this.clusters = Array<Cluster>();
    if (clusters && clusters.length > 0) {
      for (const c of clusters) {
        c.checked = false;
        this.clusters.push(c);
      }
    }
    if (id) {
      this.actionType = ActionType.EDIT;
      this.title = '编辑负载均衡';
      this.serviceService.getById(id, this.app.id).subscribe(
        status => {
          const data = status.data;
          this.service = data;
          if (!data.metaData) {
            data.metaData = '{}';
          }
          const metaData = JSON.parse(data.metaData);
          if (metaData['clusters']) {
            for (const cluster of metaData['clusters']) {
              for (let i = 0; i < this.clusters.length; i++) {
                if (cluster === this.clusters[i].name) {
                  this.clusters[i].checked = true;
                }
              }
            }
          }
        },
        error => {
          this.messageHandlerService.handleError(error);

        });
    } else {
      this.actionType = ActionType.ADD_NEW;
      this.title = '创建负载均衡';
      this.service = new Service();
    }
  }

  onCancel() {
    this.modalOpened = false;
    this.currentForm.reset();
  }

  get nameGenerateRuleConfig(): string {
    return ApiNameGenerateRule.config(
      this.authService.config[configKeyApiNameGenerateRule], this.app.metaData);
  }

  onSubmit() {
    if (this.isSubmitOnGoing) {
      return;
    }
    this.isSubmitOnGoing = true;
    this.service.appId = this.app.id;
    if (!this.service.metaData) {
      this.service.metaData = '{}';
    }
    const metaData = JSON.parse(this.service.metaData);
    const checkedCluster = Array<string>();
    this.clusters.map(cluster => {
      if (cluster.checked) {
        checkedCluster.push(cluster.name);
      }
    });
    metaData['clusters'] = checkedCluster;
    this.service.metaData = JSON.stringify(metaData);
    switch (this.actionType) {
      case ActionType.ADD_NEW:
        this.service.name = ApiNameGenerateRule.generateName(ApiNameGenerateRule.config(
          this.authService.config[configKeyApiNameGenerateRule], this.app.metaData),
          this.service.name, this.app.name);
        this.serviceService.create(this.service).subscribe(
          response => {
            this.isSubmitOnGoing = false;
            this.create.emit(response.data.id);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('创建负载均衡成功！');
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
            this.create.emit(this.service.id);
            this.modalOpened = false;
            this.messageHandlerService.showSuccess('更新负载均衡成功！');
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

