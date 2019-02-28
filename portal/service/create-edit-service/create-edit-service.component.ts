import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';
import { AuthService } from '../../../../src/app/shared/auth/auth.service';
import { Service } from '../../../shared/model/service';
import { ServiceService } from '../../../shared/client/v1/service.service';
import { CreateEditResource } from '../../../../src/app/shared/base/resource/create-edit-resource';

@Component({
  selector: 'create-edit-service',
  templateUrl: 'create-edit-service.component.html',
  styleUrls: ['create-edit-service.scss']
})
export class CreateEditServiceComponent extends CreateEditResource implements OnInit {
  defaultClusterNum = 1;
  constructor(
    public serviceService: ServiceService,
    public authService: AuthService,
    public messageHandlerService: MessageHandlerService) {
    super(serviceService, authService, messageHandlerService);
    this.registResource(new Service);
    this.registResourceType('负载均衡');
  }

  ngOnInit(): void {

  }
}

