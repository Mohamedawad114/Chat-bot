import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsNotEmpty()
  password!: string;
}
