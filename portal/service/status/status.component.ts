import { Component } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { CacheService } from '../../../../src/app/shared/auth/cache.service';
import { MessageHandlerService } from '../../../../src/app/shared/message-handler/message-handler.service';
import { ActivatedRoute } from '@angular/router';
import { KubeService } from '../../../shared/model/kubernetes/service';
import { ServiceClient } from '../../../shared/client/v1/kubernetes/service';
import { ServiceTpl } from '../../../shared/model/servicetpl';

@Component({
  selector: 'status',
  templateUrl: 'status.component.html',
  styleUrls: ['status.scss']
})

export class ServiceStatusComponent {
  createAppOpened: boolean = false;
  service: KubeService;

  constructor(private messageHandlerService: MessageHandlerService,
              private serviceClient: ServiceClient,
              private route: ActivatedRoute,
              public cacheService: CacheService) {
  }

  get appId(): number {
    return parseInt(this.route.parent.snapshot.params['id']);
  }

  getPorts() {
    let ports = [];
    if (this.service && this.service.spec.ports) {
      for (let port of this.service.spec.ports) {
        let nodePort = port.nodePort ? port.nodePort : port.port;
        ports.push(
          `${port.targetPort}:${nodePort}/${port.protocol}`);
      }
    }
    return ports.join(',');
  }

  getSelectors() {
    let lables = [];
    if (this.service && this.service.spec.selector) {
      Object.getOwnPropertyNames(this.service.spec.selector).map(key => {
        lables.push(`${key}:${this.service.spec.selector[key]}`);
      });
    }
    return lables;
  }

  newServiceStatus(cluster: string, serviceTpl: ServiceTpl) {
    this.createAppOpened = true;

    let service: KubeService = JSON.parse(serviceTpl.template);
    this.serviceClient.get(this.appId, cluster, this.cacheService.kubeNamespace, service.metadata.name).subscribe(
      response => {
        this.service = response.data;
      },
      error => {
        this.messageHandlerService.handleError(error);
      }
    );
  }


}

