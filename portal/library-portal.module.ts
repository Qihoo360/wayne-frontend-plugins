import {NgModule} from "@angular/core";
import {SharedModule} from "../../src/app/shared/shared.module";
import {SERVICE_PORTAL_MODULE} from "./service/index";

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [],
  exports: [
    SERVICE_PORTAL_MODULE
  ],
  providers: []
})

export class LibraryPortalModule {

}
