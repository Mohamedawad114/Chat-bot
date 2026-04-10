import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CompanyRepository,
  CryptoService,
  HashingService,
  UserRepository,
} from 'src/common';
import { EmailModule, MailModule } from 'src/common/Utils/services/index';
import { AuthController } from './auth.controller';

@Module({
  providers: [
    AuthService,
    UserRepository,
    CryptoService,
    HashingService,
    CompanyRepository,
  ],
  controllers: [AuthController],
  imports: [MailModule, EmailModule],
})
export class AuthModule {}
