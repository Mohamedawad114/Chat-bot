import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { PinoLogger } from 'nestjs-pino';
import { Server, Socket } from 'socket.io';
import {
  AIChatProducer,
  Auth,
  ChatFor,
  Iconversation,
  redis,
  redisKeys,
  redisSub,
  sender,
  Sys_Role,
  TokenServices,
  UserRepository,
} from 'src/common';
import { ChatServices } from '../chat/chat.service';
import { MessageDto } from '../chat/Dto/message.dto';
import { OnModuleInit } from '@nestjs/common';

@Auth(Sys_Role.user)
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class chatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    OnModuleInit
{
  @WebSocketServer() server!: Server;
  constructor(
    private readonly logger: PinoLogger,
    private readonly tokenService: TokenServices,
    private readonly userRepo: UserRepository,
    private readonly chatServices: ChatServices,
    private readonly aiChatQueue: AIChatProducer,
  ) {}
  afterInit(server: any) {
    this.logger.info('websocket initialized');
  }
  async handleConnection(client: Socket) {
    try {
      let auth =
        client.handshake.auth?.authorization ||
        client.handshake.headers?.authorization;
      if (!auth) {
        this.logger.warn('Missing accessToken');
        client.disconnect();
        throw new WsException('forbidden: must provide accessToken');
      }
      if (auth.startsWith('Bearer ')) {
        auth = auth.split(' ')[1];
      }
      const decoded = this.tokenService.VerifyAccessToken(auth);
      const user = await this.userRepo.findByIdDocument(decoded.id);
      if (!user) {
        client.disconnect();
        throw new WsException('forbidden: user not found');
      }
      client.data.user = user;
      await redis.sadd(redisKeys.socketKey(user.id.toString()), client.id);
      this.logger.info(`Client connected: ${client.id}`);
      client.join(user._id.toString());
      const conversations = await this.chatServices.userChats(
        user._id,
        ChatFor.socket,
      );
      const convs = Array.isArray(conversations)
        ? conversations
        : conversations.chats || [];
      convs.forEach((conv: Iconversation) => {
        client.join((conv._id as unknown as string).toString());
      });
    } catch (error: unknown) {
      this.logger.error(`Connection error: ${error}`);
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    try {
      const userId = client.data.user._id;
      if (!userId) return;
      await redis.srem(redisKeys.socketKey(userId.toString()), client.id);
      client.disconnect();
      this.logger.info('client disconnect');
    } catch (error) {
      this.logger.error(`client err:${error}`);
      client.disconnect();
    }
  }
  @SubscribeMessage('send-message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageDto,
  ) {
    const { content, conversationId } = data;
    const user = client.data.user;
    let chatMessage: any[] = [];
    if (conversationId) {
      chatMessage =
        (await this.chatServices.chatHistoryForAssistant(conversationId)) || [];
      await this.chatServices.messageSave(user, sender.user, data);
    }
    this.aiChatQueue.chat(user._id, content, conversationId, chatMessage);
  }
  onModuleInit() {
    const subscriber = redisSub.duplicate();
    subscriber.subscribe('chat-chunk', 'reply-done', (err, count) => {
      this.logger.info(`Subscribed to ${count} channels`);
      if (err) this.logger.error(`Subscribe error: ${err}`);
    });
    subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      if (channel === 'chat-chunk') {
        const { conversationId, userId, chunk, isNew } = data;
        if (isNew) {
          this.server
            .to(userId.toString())
            .emit('stream', { conversationId, chunk });
        } else {
          this.server.to(conversationId.toString()).emit('stream', {
            conversationId,
            chunk,
          });
        }
      }
      if (channel === 'reply-done') {
        const { userId, conversationId, fullReply, isNew } = data;
        if (isNew) {
          this.server
            .to(userId.toString())
            .emit('new-conversation', { conversationId });
        }
        this.server.to(conversationId.toString()).emit('done', { fullReply });
      }
    });
  }
}
