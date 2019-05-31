import { Service } from './service';
import { PublishStatus } from '../../../src/app/shared/model/v1/publish-status';

export class ServiceTpl {
  id: number;
  name: string;
  serviceId: number;
  template: string;
  description: string;
  deleted: boolean;
  user: string;
  createTime: Date;
  updateTime?: Date;
  service: Service;

  ports: string;
  status: PublishStatus[];
}

