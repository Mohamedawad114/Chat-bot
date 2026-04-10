import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  GlobalErrFilter,
  ResponseInterceptor,
  TimeoutInterceptor,
} from './common';
import { LoggerModule } from 'nestjs-pino';
import { resolve } from 'path';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      waitQueueTimeoutMS: 30000,
    }),
    ConfigModule.forRoot({
      envFilePath: resolve('config/dev.env'),
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 2000 }],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_INTERCEPTOR', useClass: ResponseInterceptor },
    { provide: 'APP_INTERCEPTOR', useClass: TimeoutInterceptor },
    { provide: 'APP_FILTER', useClass: GlobalErrFilter },
    { provide: 'APP_GUARD', useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
