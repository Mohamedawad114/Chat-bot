import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
