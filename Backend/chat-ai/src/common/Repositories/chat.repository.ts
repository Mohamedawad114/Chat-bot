import { BaseRepository } from './Base.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
  Message,
  MessageDocument,
} from '../models';

@Injectable()
export class ConversionRepository extends BaseRepository<ConversationDocument> {
  constructor(
    @InjectModel(Conversation.name)
    protected conversionModel: Model<ConversationDocument>,
  ) {
    super(conversionModel);
  }
}
@Injectable()
export class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(
    @InjectModel(Message.name)
    protected messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }
}
