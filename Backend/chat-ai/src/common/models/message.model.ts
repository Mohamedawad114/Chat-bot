import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Imessage } from '../Interfaces';
import { HydratedDocument, Types } from 'mongoose';
import { sender } from '../Enum';

@Schema({ autoIndex: true, strict: true, strictQuery: true })
export class Message implements Imessage {
  @Prop({ type: String, required: true })
  content!: string;
  @Prop({ type: Types.ObjectId, required: true })
  conversationId!: Types.ObjectId;
  @Prop({ type: String, enum: sender, required: true })
  sendBy!: sender;
}
const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = HydratedDocument<Message>;
export const messageModel = MongooseModule.forFeature([
  {
    name: Message.name,
    schema: MessageSchema,
  },
]);
