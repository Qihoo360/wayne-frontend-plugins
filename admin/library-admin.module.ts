import { NgModule } from '@angular/core';
import { SharedModule } from '../../src/app/shared/shared.module';
import { SERVICE_ADMIN_MODULE } from './service/index';
import { SERVICE_SERVICETPL_ADMIN_MODULE } from './servicetpl/index';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [],
  exports: [
    SERVICE_ADMIN_MODULE,
    SERVICE_SERVICETPL_ADMIN_MODULE
  ],
  providers: []
})

export class LibraryAdminModule {

}
