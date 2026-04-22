import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CryptoService,
  HashingService,
  userModel,
  UserRepository,
} from 'src/common';
import { EmailModule, MailModule, OAuth2 } from 'src/common/Utils/services/index';
import { AuthController } from './auth.controller';

@Module({
  providers: [
    AuthService,
    UserRepository,
    CryptoService,
    HashingService,
    OAuth2,
  ],
  controllers: [AuthController],
  imports: [MailModule, EmailModule,userModel],
})
export class AuthModule {}
