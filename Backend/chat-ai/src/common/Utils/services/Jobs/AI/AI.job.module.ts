// import { Module } from '@nestjs/common';
// import {
//   AIReportRepository,
//   AISkillMatchRepository,
//   ApplicationRepository,
// } from 'src/common/Repositories';
// import { AIModule } from 'src/modules/AI/ai.module';
// import { AIPAnalysisProducer } from './AI.job.producer';
// import { CvExtractorService } from '../../pdf-parser';
// import { AIAnalysisProcessor } from './AI.job.processor';
// import { AIService } from 'src/modules/AI/ai.service';
// import { BullModule } from '@nestjs/bullmq';

// @Module({
//   imports: [
//     AIModule,
//     BullModule.registerQueue({
//       name: 'AIAnalysis',
//     }),
//   ],
//   providers: [
//     ApplicationRepository,
//     AIPAnalysisProducer,
//     CvExtractorService,
//     AISkillMatchRepository,
//     AIReportRepository,
//     AIAnalysisProcessor,
//   ],
//   exports: [AIPAnalysisProducer, AIAnalysisProcessor],
// })
// export class AIJobModule {}
