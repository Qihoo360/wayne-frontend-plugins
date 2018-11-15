import {Routes} from "@angular/router";
import {SERVICE_ADMIN_PATH} from "./service/index";
import {SERVICE_SERVICETPL_ADMIN_PATH} from "./servicetpl/index";

export const ADMINROUTES: Routes = [
  ...SERVICE_ADMIN_PATH,
  ...SERVICE_SERVICETPL_ADMIN_PATH];

