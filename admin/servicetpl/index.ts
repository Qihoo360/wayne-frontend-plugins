import { ServiceTplComponent } from './servicetpl.component';
import { TrashServiceTplComponent } from './trash-servicetpl/trash-servicetpl.component';
import { ServiceTplModule } from './servicetpl.module';


export const SERVICE_SERVICETPL_ADMIN_PATH = [
  {path: 'service/tpl', component: ServiceTplComponent},
  {path: 'service/tpl/trash', component: TrashServiceTplComponent},
  {path: 'service/relate-tpl/:sid', component: ServiceTplComponent},
];

export const SERVICE_SERVICETPL_ADMIN_MODULE = [ServiceTplModule];

