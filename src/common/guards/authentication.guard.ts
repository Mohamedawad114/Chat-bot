import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { redis, redisKeys, TokenServices } from '../Utils/services';
import { UserRepository } from '../Repositories';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenServices,
    private readonly userRepo: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();
    switch (type) {
      case 'http': {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) return false;
        const token = authHeader.split(' ')[1];
        if (!token) return false;
        let decoded;
        try {
          decoded = this.tokenService.VerifyAccessToken(token);
          request.user = decoded;
        } catch (error: any) {
          if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedException('Token expired');
          }
          throw new UnauthorizedException('Invalid token');
        }
        const isBlacklisted = await redis.get(redisKeys.token_blackList(token));
        if (isBlacklisted) return false;
        const user = await this.userRepo.findByIdDocument(decoded.id);
        if (!user) throw new NotFoundException('user not found');
        request.user = user;
        return true;
      }
      case 'ws': {
        const client: Socket = context.switchToWs().getClient();
        const auth =
          client.handshake.auth?.authorization ??
          client.handshake.headers['authorization'];
        if (!auth) return false;
        const token = auth.split(' ')[1];
        if (!token) return false;
        const tokenDecoded = this.tokenService.VerifyAccessToken(token);
        const isBlacked = await redis.get(redisKeys.token_blackList(token));
        if (isBlacked) return false;
        const user = await this.userRepo.findByIdDocument(tokenDecoded.id);
        if (!user) throw new NotFoundException('user not found');
        client.data.user = user;
        return true;
      }
    }
    return false;
  }
}
