import { NgModule } from '@angular/core';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { CreateEditServiceComponent } from './create-edit-service/create-edit-service.component';
import { ServiceComponent } from './service.component';
import { ListServiceComponent } from './list-service/list-service.component';
import { TrashServiceComponent } from './trash-service/trash-service.component';
import { ServiceService } from '../../shared/client/v1/service.service';

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [
    ServiceService
  ],
  exports: [ServiceComponent,
    ListServiceComponent],
  declarations: [ServiceComponent,
    ListServiceComponent, CreateEditServiceComponent, TrashServiceComponent]
})

export class ServiceModule {
}
