import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BreadcrumbService } from '../../../../src/app/shared/client/v1/breadcrumb.service';
import { Router } from '@angular/router';
import { ClrDatagridStateInterface } from '@clr/angular';
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
  currentPage = 1;
  state: ClrDatagridStateInterface;

  @Output() paginate = new EventEmitter<ClrDatagridStateInterface>();
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

  refresh(state: ClrDatagridStateInterface) {
    this.state = state;
    this.paginate.emit(state);
  }

  deleteService(service: Service) {
    this.delete.emit(service);
  }

  editService(service: Service) {
    this.edit.emit(service);
  }

  goToLink(obj: Service, gate: string) {
    let linkUrl = '';
    switch (gate) {
      case 'tpl':
        linkUrl = `/admin/service/tpl?serviceId=${obj.id}`;
        break;
      case 'app':
        linkUrl = `admin/app?id=${obj.app.id}`;
        break;
      default:
        break;
    }
    this.router.navigateByUrl(linkUrl);
  }

  detailMetaDataTpl(tpl: string) {
    this.aceEditorService.announceMessage(AceEditorMsg.Instance(tpl, false, '元数据查看'));
  }
}
