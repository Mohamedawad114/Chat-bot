import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Types } from "mongoose";

export class ChatHistory {
  @IsString()
  @IsOptional()
  cursor?: string;
  @IsMongoId()
  conversationId!: Types.ObjectId;
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
