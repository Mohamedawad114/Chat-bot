import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'اهلا بك ي صديقى انا فى خدمتك';
  }
}
