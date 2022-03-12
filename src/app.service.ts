import { Injectable } from '@nestjs/common';
import { User } from './infra/database/entity/UserEntity';
import { MongoDBAdapter } from './infra/database/MondoDBAdapter/MongoDBAdapter';

@Injectable()
export class AppService {
  mongoAdapter: MongoDBAdapter;

  constructor(){
    this.mongoAdapter = new MongoDBAdapter(User);
  }
  getHello(): string {
    return 'Hello World!';
  }

  qrcodeDecode() {
return "ok"
  }
}
