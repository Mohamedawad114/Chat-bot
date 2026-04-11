import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  CommonModule,
  GlobalErrFilter,
  redis,
  ResponseInterceptor,
  TimeoutInterceptor,
} from './common';
import { LoggerModule } from 'nestjs-pino';
import { resolve } from 'path';
import { AuthModule } from './modules';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('config/dev.env'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 30000,
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
    BullModule.forRoot({
      connection:redis
    }),
    CommonModule,
    AuthModule,
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
