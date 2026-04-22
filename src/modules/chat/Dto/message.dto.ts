import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';

export class MessageDto {
  @Length(1, 1000)
  @IsNotEmpty()
  content!: string;
  @IsMongoId()
  @IsOptional()
  conversationId?: Types.ObjectId;
}
