import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreadcrumbService } from '../../../../src/app/shared/client/v1/breadcrumb.service';
import { Router } from '@angular/router';
import { State } from '@clr/angular';
import { Service } from '../../../shared/model/service';
import { Page } from '../../../../src/app/shared/page/page-state';
import { AceEditorService } from '../../../../src/app/shared/ace-editor/ace-editor.service';
import { AceEditorMsg } from '../../../../src/app/shared/ace-editor/ace-editor';

@Component({
  selector: 'list-service',
  templateUrl: 'list-service.component.html'
})
export class ListServiceComponent implements OnInit {

  @Input() services: Service[];

  @Input() page: Page;
  currentPage: number = 1;
  state: State;

  @Output() paginate = new EventEmitter<State>();
  @Output() delete = new EventEmitter<Service>();
  @Output() edit = new EventEmitter<Service>();


  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private aceEditorService: AceEditorService
  ) {
    breadcrumbService.hideRoute('/admin/service/relate-tpl');
    breadcrumbService.hideRoute('/admin/service/app');
  }

  ngOnInit(): void {
  }

  pageSizeChange(pageSize: number) {
    this.state.page.to = pageSize - 1;
    this.state.page.size = pageSize;
    this.currentPage = 1;
    this.paginate.emit(this.state);
  }

  refresh(state: State) {
    this.state = state;
    this.paginate.emit(state);
  }

  deleteService(service: Service) {
    this.delete.emit(service);
  }

  editService(service: Service) {
    this.edit.emit(service);
  }

  goToLink(service: Service, gate: string) {
    let linkUrl = new Array();
    switch (gate) {
      case 'tpl':
        this.breadcrumbService.addFriendlyNameForRouteRegex('/admin/service/relate-tpl/[0-9]*', '[' + service.name + ']模板列表');
        linkUrl = ['admin', 'service', 'relate-tpl', service.id];
        break;
      case 'app':
        this.breadcrumbService.addFriendlyNameForRouteRegex('/admin/service/app/[0-9]*', '[' + service.app.name + ']项目详情');
        linkUrl = ['admin', 'service', 'app', service.app.id];
        break;
      default:
        break;
    }
    this.router.navigate(linkUrl);
  }

  detailMetaDataTpl(tpl: string) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(tpl, false, '元数据查看'));
  }
}
