import { Types } from 'mongoose';
import { sender } from '../Enum';

export interface Imessage {
  content: string;
  sendBy: sender;
  conversationId: Types.ObjectId;
}
export interface Iconversation {
  conversationName: string;
  userId: Types.ObjectId;
}
