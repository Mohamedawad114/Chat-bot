import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatServices } from './chat.service';
import { Auth, AuthUser,ChatFor,type IUser, Sys_Role } from 'src/common';
import { ChatHistory, MongoId } from './Dto/chat.history.dto';
import { Types } from 'mongoose';

@Auth(Sys_Role.user)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatServices: ChatServices) {}

  @Get('conversations')
  async getUserChats(
    @AuthUser()user:IUser,
    @Query() query: ChatHistory,
  ) {
    const { cursor, limit } = query;
    return await this.chatServices.userChats(
   user._id as unknown as string,
      ChatFor.request,
      cursor,
      limit ? Number(limit) : 10,
    );
  }
  @Get(':conversationId/history')
  async getChatHistory(
    @AuthUser()user:IUser,
    @Param() data: MongoId,
    @Query() query: ChatHistory,
  ) {
    const { cursor, limit } = query;
    return await this.chatServices.getChatHistory(
      data.conversationId,
      user,
      cursor,
      limit ? Number(limit) : 10,
    );
  }
}
