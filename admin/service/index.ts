import { ServiceComponent } from './service.component';
import { TrashServiceComponent } from './trash-service/trash-service.component';
import { ServiceModule } from './service.module';


export const SERVICE_ADMIN_PATH = [
  {path: 'service/app/:aid', component: ServiceComponent},
  {path: 'service', component: ServiceComponent},
  {path: 'service/trash', component: TrashServiceComponent},
];

export const SERVICE_ADMIN_MODULE = [ServiceModule];

