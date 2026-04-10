import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CompanyRepository,
  CryptoService,
  HashingService,
  qualifyAge,
  UserRepository,
} from 'src/common';
import { emailType, Sys_Role } from 'src/common/Enum';
import {
  EmailProducer,
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
    private readonly companyRepo: CompanyRepository,
  ) {}

  SignUp = async (data: signupDto) => {
    const checkEmail = await this.userRepo.findByEmail(data.email);
    if (checkEmail) throw new ConflictException(`email is already exist`);
    const checkAge = qualifyAge(data.dateBirth);
    if (!checkAge) throw new BadRequestException(`age must be greater than 16`);
    data.phoneNumber = this.crypto.encryption(data.phoneNumber);
    if (data.companyId) {
      const company = await this.companyRepo.findById(data.companyId);
      if (!company) throw new NotFoundException('company not found');
    }
    const userCreated = await this.userRepo.create({
      ...data,
      company: data.companyId ? { connect: { id: data.companyId } } : undefined,
    });
    await this.emailQueue.sendEmailJob(
      emailType.confirmation,
      userCreated.email,
    );
    return {
      message: 'signup successfully',
      data: {
        user: {
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
          dateBirth: userCreated.dateBirth,
        },
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
    await this.userRepo.updateById(User.id, { isConfirmed: true });
    return { message: `email is confirmed ` };
  };

  resendOTP = async (Dto: ResendOtpDto) => {
    const email: string = Dto.email;
    const User = await this.userRepo.findOne({
      email: email,
      isConfirmed: false,
    });
    if (!User) throw new NotFoundException(`email not found or confirmed`);
    await this.emailQueue.sendEmailJob(emailType.confirmation, email);
    return { message: 'OTP send' };
  };

  loginUser = async (Dto: LoginDto, res: Response) => {
    const { email, password } = Dto;
    const user = await this.userRepo.findByEmail(email);
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
        id: user.id,
        role: user.role || Sys_Role.user,
        username: user.name,
      },
      res,
    );
    return { message: 'Login successfully', data: { accessToken } };
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedException();
    const decoded = this.TokenServices.VerifyRefreshToken(token);
    const isExisted = await redis.get(
      redisKeys.refreshToken(decoded.id, decoded.jti),
    );
    if (!isExisted) {
      throw new ForbiddenException();
    }
    await redis.del(redisKeys.refreshToken(decoded.id, decoded.jti));
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
      decoded.jti,
    );
    return { message: 'AccessToken', data: { accessToken } };
  };
}
