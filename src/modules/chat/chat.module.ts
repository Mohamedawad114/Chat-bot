import { Module } from '@nestjs/common';
import {
  conversationModel,
  ConversionRepository,
  messageModel,
  MessageRepository,
} from 'src/common';
import { ChatServices } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [messageModel, conversationModel],
  providers: [
    MessageRepository,
    ConversionRepository,
    ChatServices,
  ],
  controllers:[ChatController],
  exports: [ChatServices],
})
export class ChatModule {}
