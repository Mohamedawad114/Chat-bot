import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChatFor,
  ConversionRepository,
  IUser,
  MessageRepository,
  redis,
  redisKeys,
  sender,
} from 'src/common';
import { MessageDto } from './Dto/message.dto';
import { decoderCursor, encodedCursor } from 'src/common/Utils/helpers';
import { Types } from 'mongoose';

@Injectable()
export class ChatServices {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly conversationRepo: ConversionRepository,
  ) {}

  messageSave = async (user: IUser, role: sender, message: MessageDto) => {
    if (!message.content.trim().length)
      throw new BadRequestException('message must have content');
    let conversation;
    if (message.conversationId) {
      conversation = await this.conversationRepo.findByIdDocument(
        message.conversationId,
        { _id: 1 },
      );
      if (!conversation)
        throw new BadRequestException('conversation not found ');
    } else {
      conversation = await this.conversationRepo.create({ userId: user._id });
    }
    return await this.messageRepo.create({
      conversationId: conversation._id,
      sendBy: role,
      content: message.content,
    });
  };
  getChatHistory = async (
    conversationId: Types.ObjectId | string,
    cursor?: string,
    limit: number = 10,
  ) => {
    const decodedCursor = decoderCursor(cursor);
    const conversation = await this.conversationRepo.findByIdDocument(
      conversationId,
      { _id: 1 },
    );
    if (!conversation) throw new BadRequestException('conversation not found ');
    const filter: any = {
      conversationId: new Types.ObjectId(conversationId),
    };
    if (decodedCursor) {
      filter.$or = [
        { createdAt: { $lt: decodedCursor.createdAt } },
        {
          createdAt: decodedCursor.createdAt,
          _id: { $lt: decodedCursor.id },
        },
      ];
    }
    const chatMessages = await this.messageRepo.findDocuments(
      filter,
      {},
      {
        limit: limit,
        sort: { createdAt: -1, _id: -1 },
      },
    );
    if (!chatMessages.length) {
      return { messages: [], meta: { nextCursor: null } };
    }
    const lastItem = chatMessages[chatMessages.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem._id,
      createdAt: lastItem.createdAt,
    });
    return { data: chatMessages, meta: { nextCursor: nextCursor } };
  };
  chatHistoryForAssistant = async (conversationId: Types.ObjectId | string) => {
    const cached = await redis.get(
      redisKeys.chatHistory(conversationId.toString()),
    );
    if (cached) return JSON.parse(cached);
    const chatMessages = await this.messageRepo.findDocuments(
      { conversationId: conversationId },
      { content: 1, sendBy: 1 },
      {
        sort: { createdAt: 1 },
      },
    );
    if (!chatMessages.length) return [];
    const messages = chatMessages.map((msg) => ({
      role: msg.sendBy === sender.user ? sender.user : sender.assistant,
      content: msg.content,
    }));
    await redis.set(
      redisKeys.chatHistory(conversationId.toString()),
      JSON.stringify(messages),
      'EX',
      60 * 60,
    );
    return messages;
  };
  userChats = async (
    userId: Types.ObjectId,
    chatsFor: ChatFor,
    cursor?: string,
    limit: number = 10,
  ) => {
    if (chatsFor === ChatFor.socket) {
      const chats = await this.conversationRepo.findDocuments(
        {
          userId: userId,
        },
        {
          _id: 1,
        },
      );
      return chats;
    }
    const decodedCursor = decoderCursor(cursor);
    const filter: any = { userId: userId };
    if (decodedCursor) {
      filter.$or = [
        { createdAt: { $lt: decodedCursor.createdAt } },
        {
          createdAt: decodedCursor.createdAt,
          _id: { $lt: decodedCursor.id },
        },
      ];
    }
    const chats = await this.conversationRepo.findDocuments(
      filter,
      {
        _id: 1,
        conversationName: 1,
      },
      { sort: { createdAt: -1 } },
    );
    if (!chats.length) {
      return { chats: [], meta: { nextCursor: null } };
    }
    const lastItem = chats[chats.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem._id,
      createdAt: lastItem.createdAt,
    });
    return { data: chats, meta: { nextCursor: nextCursor } };
  };
}
