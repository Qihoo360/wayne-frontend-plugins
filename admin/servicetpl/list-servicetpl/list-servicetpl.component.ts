import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ClrDatagridStateInterface } from '@clr/angular';
import { ServiceTpl } from '../../../shared/model/servicetpl';
import { Page } from '../../../../src/app/shared/page/page-state';

@Component({
  selector: 'list-servicetpl',
  templateUrl: 'list-servicetpl.component.html'
})
export class ListServiceTplComponent implements OnInit {

  @Input() serviceTpls: ServiceTpl[];

  @Input() page: Page;
  currentPage = 1;
  state: ClrDatagridStateInterface;

  @Output() paginate = new EventEmitter<ClrDatagridStateInterface>();
  @Output() delete = new EventEmitter<ServiceTpl>();
  @Output() edit = new EventEmitter<ServiceTpl>();


  constructor(private router: Router) {
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

  deleteServiceTpl(serviceTpl: ServiceTpl) {
    this.delete.emit(serviceTpl);
  }

  editServiceTpl(serviceTpl: ServiceTpl) {
    this.edit.emit(serviceTpl);
  }
}
