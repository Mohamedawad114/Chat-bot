import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ChatServices } from './chat.service';
import { Auth, AuthUser, ChatFor, type IUser, Sys_Role } from 'src/common';
import { Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

@Auth(Sys_Role.user)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatServices: ChatServices,
    private logger: PinoLogger,
  ) {}

  @Get('conversations')
  async getUserChats(
    @AuthUser() user: IUser,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
  ) {
    return await this.chatServices.userChats(
      new Types.ObjectId(user._id),
      ChatFor.request,
      cursor,
      limit,
    );
  }
  @Get(':conversationId/history')
  async getChatHistory(
    @AuthUser() user: IUser,
    @Param('conversationId')conversationId: Types.ObjectId,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
  ) {
    return await this.chatServices.getChatHistory(
     new Types.ObjectId( conversationId),
      user,
      cursor,
      limit,
    );
  }
}
