import { NgModule } from '@angular/core';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { ServiceTplComponent } from './servicetpl.component';
import { ListServiceTplComponent } from './list-servicetpl/list-servicetpl.component';
import { CreateEditServiceTplComponent } from './create-edit-servicetpl/create-edit-servicetpl.component';
import { TrashServiceTplComponent } from './trash-servicetpl/trash-servicetpl.component';
import { ServiceTplService } from '../../shared/client/v1/servicetpl.service';

@NgModule({
  imports: [
    SharedModule,
  ],
  providers: [
    ServiceTplService
  ],
  exports: [ServiceTplComponent,
    ListServiceTplComponent],
  declarations: [ServiceTplComponent,
    ListServiceTplComponent, CreateEditServiceTplComponent, TrashServiceTplComponent]
})

export class ServiceTplModule {
}
