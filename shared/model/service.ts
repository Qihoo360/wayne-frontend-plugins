import {App} from '../../../src/app/shared/model/v1/app';

export class Service {
  id: number;
  name: string;
  metaData: string;
  user: string;
  appId: number;
  metaDataObj: {};
  description: string;
  deleted: boolean;
  createTime: Date;
  app: App;
  order: number;
}
