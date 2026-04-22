import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { IPayload } from 'src/common/Interfaces';
@Injectable()
export class OAuth2 {
  constructor(private readonly configService: ConfigService) {}
  async verifyLoginGoogle(idToken: string): Promise<IPayload> {
    const client = new OAuth2Client(this.configService.get<string>('CLIENTID'));
     const ticket = await client.verifyIdToken({
       idToken: idToken,
       audience: process.env.CLIENTID,
     });
    const payload = ticket.getPayload();
    if (!payload) throw new NotFoundException('payload not found');
    return payload as IPayload;
  }
}
