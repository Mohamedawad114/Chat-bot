import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class MongoId {
  @IsMongoId()
  conversationId!: Types.ObjectId;
}
