import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailServices } from './mail.service';
import { HashingService } from '../../Hashing/hash.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          family: 4,
          secure: false,
          auth: {
            user: configService.get<string>('APP_GMAIL'),
            pass: configService.get<string>('APP_PASSWORD'),
          },
        },
      }),
    }),
  ],
  providers: [EmailServices, HashingService],
  exports: [EmailServices],
})
export class MailModule {}
