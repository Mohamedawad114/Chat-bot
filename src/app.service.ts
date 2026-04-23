import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'اهلا بك ي صديقى انا فى خدمتك' };
  }
}
