import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Iconversation } from '../Interfaces';

import { HydratedDocument, Types } from 'mongoose';

@Schema({ autoIndex: true, strict: true, strictQuery: true })
export class Conversation implements Iconversation {
  @Prop({ type: String, required: true })
  conversationName!: string;
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;
}
const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ conversationName: 'text' });
ConversationSchema.index({ userId: 1 });
export type ConversationDocument = HydratedDocument<Conversation>;
export const conversationModel = MongooseModule.forFeature([
  {
    name: Conversation.name,
    schema: ConversationSchema,
  },
]);
