import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IUser } from 'src/common';
import { Gender } from 'src/common/Enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class signupDto implements Partial<IUser> {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Mohamed Awad',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'mohamed@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description:
      'Password with at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char',
    example: 'StrongP@ss123',
    format: 'password',
  })
  @IsString()
  @Length(8, 64)
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number and special character',
    },
  )
  password!: string;

  @ApiProperty({
    description: 'Phone number including country code',
    example: '201012345678',
    minLength: 10,
    maxLength: 15,
  })
  @IsString()
  @Length(10, 15)
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({
    enum: Gender,
    description: 'User gender',
    example: Gender.male,
  })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Birth date of the user',
    example: '2000-01-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  dateBirth!: Date;
}
