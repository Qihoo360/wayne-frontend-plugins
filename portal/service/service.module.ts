import {NgModule} from "@angular/core";
import {CreateEditServiceComponent} from "./create-edit-service/create-edit-service.component";
import {ListServiceComponent} from "./list-service/list-service.component";
import {CreateEditServiceTplComponent} from "./create-edit-servicetpl/create-edit-servicetpl.component";
import {ReactiveFormsModule} from "@angular/forms";
import {PublishServiceTplComponent} from "./publish-tpl/publish-tpl.component";
import {ServiceClient} from "../../shared/client/v1/kubernetes/service";
import {ServiceService} from "../../shared/client/v1/service.service";
import {ServiceTplService} from "../../shared/client/v1/servicetpl.service";
import {ServiceStatusComponent} from "./status/status.component";
import {ServiceComponent} from "./service.component";
import {SharedModule} from "../../../src/app/shared/shared.module";

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [
    ServiceService,
    ServiceTplService,
    ServiceClient
  ],
  exports: [
    ServiceComponent
  ],
  declarations: [
    ServiceComponent,
    ListServiceComponent,
    CreateEditServiceComponent,
    CreateEditServiceTplComponent,
    PublishServiceTplComponent,
    ServiceStatusComponent,
  ]
})

export class ServiceModule {
}
