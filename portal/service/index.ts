import { ServiceComponent } from './service.component';
import { CreateEditServiceTplComponent } from './create-edit-servicetpl/create-edit-servicetpl.component';
import { ServiceModule } from './service.module';

export const SERVICE_PORTAL_PATH = [
  {path: 'service', component: ServiceComponent},
  {path: 'service/:serviceId', component: ServiceComponent},
  {path: 'service/:serviceId/tpl', component: CreateEditServiceTplComponent},
  {path: 'service/:serviceId/tpl/:tplId', component: CreateEditServiceTplComponent},
];

export const SERVICE_PORTAL_MODULE = [ServiceModule];

