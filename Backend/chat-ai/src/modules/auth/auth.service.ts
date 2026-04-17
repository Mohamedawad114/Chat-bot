import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CryptoService, HashingService, UserRepository } from 'src/common';
import { emailType, Provider } from 'src/common/Enum';
import {
  EmailProducer,
  OAuth2,
  redis,
  redisKeys,
  TokenServices,
} from 'src/common/Utils/services/index';
import { ConfirmEmailDto, LoginDto, ResendOtpDto, signupDto } from './Dto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly crypto: CryptoService,
    private readonly HashService: HashingService,
    private readonly TokenServices: TokenServices,
    private readonly emailQueue: EmailProducer,
    private readonly oAuth2: OAuth2,
  ) {}

  SignUp = async (data: signupDto) => {
    const checkEmail = await this.userRepo.findByEmail(data.email);
    if (checkEmail) throw new ConflictException(`email is already exist`);
    data.phoneNumber = this.crypto.encryption(data.phoneNumber);
    const userCreated = await this.userRepo.create({
      ...data,
    });
    await this.emailQueue.sendEmailJob(
      emailType.confirmation,
      userCreated.email,
    );
    return {
      message: 'signup successfully',
      data: {
        username: userCreated.username,
        email: userCreated.email,
        dataBirth: userCreated.dateBirth,
        gender: userCreated.gender,
        isConfirmed: userCreated.isConfirmed,
        _id: userCreated._id,
      },
    };
  };
  ConfirmEmail = async (Dto: ConfirmEmailDto) => {
    const User = await this.userRepo.findByEmail(Dto.email);
    if (!User) throw new NotFoundException(`user not found`);
    const savedOTP = await redis.get(redisKeys.OTP(Dto.email));
    if (!savedOTP) {
      throw new BadRequestException(`expire OTP`);
    }
    const isMAtch = this.HashService.compare_hash(Dto.OTP, savedOTP);
    if (!isMAtch) throw new BadRequestException(`invalid OTP`);
    User.isConfirmed = true;
    await redis.del(redisKeys.OTP(Dto.email));
    await this.userRepo.updateDocument(
      { _id: User._id },
      { isConfirmed: true },
    );
    return { message: `email is confirmed ` };
  };

  resendOTP = async (Dto: ResendOtpDto) => {
    const email: string = Dto.email;
    const User = await this.userRepo.findOneDocument({
      email: email,
      isConfirmed: false,
    });
    if (!User) throw new NotFoundException(`email not found or confirmed`);
    await this.emailQueue.sendEmailJob(emailType.confirmation, email);
    return { message: 'OTP send' };
  };

  loginUser = async (Dto: LoginDto, res: Response) => {
    const { email, password } = Dto;
    const user = await this.userRepo.findByEmail(email,{password:1,username:1,_id:1,isConfirmed:1});
    if (!user) throw new NotFoundException(`email not found`);
    if (!user.isConfirmed) {
      throw new BadRequestException(
        `email not verified please verify email first`,
      );
    }
    const passMatch = await this.HashService.compare_hash(
      password,
      user?.password as string,
    );
    if (!passMatch) throw new BadRequestException(`invalid Password or email`);
    const { accessToken } = await this.TokenServices.generateTokens(
      {
        id: user._id,
        username: user.username,
      },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };
  signupWithGoogle = async (idToken: string, res: Response) => {
    if (!idToken) throw new BadRequestException('idToken is required');
    const payload = await this.oAuth2.verifyLoginGoogle(idToken);
    if (!payload.email_verified)
      throw new BadRequestException('email must be verified');
    const userIsExist = await this.userRepo.findByEmail(payload.email);
    if (userIsExist) {
      const accessToken = this.TokenServices.generateAccessToken({
        id: userIsExist._id,
        username: userIsExist.username,
      });
      return { message: 'Login successfully', data: { accessToken } };
    }
    const userCreated = await this.userRepo.create({
      email: payload.email,
      username: payload.name,
      isConfirmed: payload.email_verified,
      provider: Provider.google,
      subId: payload.sub,
    });
    const { accessToken } = await this.TokenServices.generateTokens(
      { id: userCreated._id, username: userCreated.username },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedException();
    const decoded = this.TokenServices.VerifyRefreshToken(token);
    const isExisted = await redis.get(
      redisKeys.refreshToken(decoded.id.toString(), decoded.jti),
    );
    if (!isExisted) {
      throw new ForbiddenException();
    }
    await redis.del(redisKeys.refreshToken(decoded.id.toString(), decoded.jti));
    const accessToken: string = this.TokenServices.generateAccessToken({
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    });
    await this.TokenServices.generateRefreshTokens(
      {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
      },
      res,
    );
    return { message: 'AccessToken', data: { accessToken } };
  };
}
