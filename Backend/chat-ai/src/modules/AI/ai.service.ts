import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PinoLogger } from 'nestjs-pino';
import { chatSystemPrompt, conversationNamePrompt } from './ai.prompt';
@Injectable()
export class AIServices implements OnModuleInit {
  private client!: Groq;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}
  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API');
    if (!apiKey) throw new BadRequestException('apiKey not found');
    this.client = new Groq({ apiKey: apiKey });
    this.logger.info('Groq connected successfully');
  }
  async generateStream(messages, onChunk) {
    const stream = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: chatSystemPrompt,
        },
        ...messages,
      ],
      stream: true,
    });
    let fullReply = '';
    for await (const part of stream) {
      const chunk = part.choices[0]?.delta?.content;
      if (chunk) {
        fullReply += chunk;
        onChunk(chunk);
      }
    }
    return fullReply;
  }
  async generateConversationName(firstMessage: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: conversationNamePrompt,
        },
        { role: 'user', content: firstMessage },
      ],
      temperature: 0.4,
      max_completion_tokens: 20,
    });
    return response.choices[0]?.message?.content || 'New Chat';
  }
}
