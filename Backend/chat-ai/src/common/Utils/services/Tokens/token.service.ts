import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidV4 } from 'uuid';
import { redis } from '../redis';
import { Sys_Role } from 'src/common/Enum';
import { IDecodedToken, IToken } from 'src/common/Interfaces';

@Injectable()
export class TokenServices {
  constructor(private readonly Jwt: JwtService) {}

  generateTokens = async (
    { id, username, role = Sys_Role.user }: IToken,
    Res: any,
  ) => {
    const jti = uuidV4();
    const accessToken = this.Jwt.sign(
      { id, username, role },
      { expiresIn: '30m' },
    );
    const refreshToken = this.Jwt.sign(
      { id, username, role, jti },
      { expiresIn: '7d' },
    );
    await redis.set(`refreshToken_${id}:${jti}`, '1', 'EX', 60 * 60 * 24 * 7);
    Res?.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    return { accessToken };
  };

  generateAccessToken = (payload: IToken) => {
    return this.Jwt.sign(payload, { expiresIn: '30m' });
  };
  generateRefreshTokens = async (
    { id, username, role = Sys_Role.user }: IToken,
    Res: any,
  ) => {
    const newJti = uuidV4();
    const refreshToken = this.Jwt.sign(
      { id, username, role, jti: newJti },
      { expiresIn: '7d' },
    );
    await redis.set(
      `refreshToken_${id}:${newJti}`,
      '1',
      'EX',
      60 * 60 * 24 * 7,
    );
    Res?.cookie('refreshToken', refreshToken, {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
  };
  VerifyAccessToken = (Token: string) => {
    return this.Jwt.verify(Token);
  };
  VerifyRefreshToken = (Token: string): IDecodedToken => {
    if (!Token) {
      throw new UnauthorizedException('token is required');
    }
    return this.Jwt.verify(Token);
  };
}
