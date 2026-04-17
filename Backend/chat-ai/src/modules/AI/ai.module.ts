import { Module } from '@nestjs/common';
import { AIServices } from './ai.service';

@Module({ providers: [AIServices], exports: [AIServices] })
export class AiModule {}
