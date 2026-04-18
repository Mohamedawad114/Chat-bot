import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Types } from "mongoose";

export class ChatHistory {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
export class MongoId {
  @IsMongoId()
  conversationId!: Types.ObjectId;
}