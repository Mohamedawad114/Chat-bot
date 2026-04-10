// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
// import { Job } from 'bullmq';
// import { PinoLogger } from 'nestjs-pino';
// import {
//   AIReportRepository,
//   AISkillMatchRepository,
//   ApplicationRepository,
// } from 'src/common/Repositories';
// import { AIService } from 'src/modules/AI/ai.service';
// import { CvExtractorService } from '../../pdf-parser';
// import { NotFoundException } from '@nestjs/common';

// @Processor('AIAnalysis', {
//   limiter: {
//     max: 2,
//     duration: 60000,
//   },
// })
// export class AIAnalysisProcessor extends WorkerHost {
//   constructor(
//     private applicationRepo: ApplicationRepository,
//     private readonly aiService: AIService,
//     private readonly cvExtractSErvice: CvExtractorService,
//     private readonly AIReportRepo: AIReportRepository,
//     private readonly AISkillMatchRepo: AISkillMatchRepository,
//     private readonly logger: PinoLogger,
//   ) {
//     super();
//   }

//   async process(job: Job) {
//     const { applicationId } = job.data;
//     const application = await this.applicationRepo.findById(applicationId, {
//       include: {
//         job: {
//           include: {
//             skills: {
//               include: {
//                 skill: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     if (!application) {
//       throw new NotFoundException(`Application not found: ${applicationId}`);
//     }
//     let cvText: string;
//     try {
//       cvText = await this.cvExtractSErvice.extractText(application.CV);
//     } catch (error) {
//       this.logger.error(
//         {
//           err: error,
//           message: error?.message,
//           stack: error?.stack,
//           cvUrl: application.CV,
//         },
//         'Failed to extract CV text',
//       );
//       throw error;
//     }

//     const skills = application.job.skills.map((s) => s.skill.skill);
//     let result: Awaited<ReturnType<typeof this.aiService.analyzeCV>>;
//     try {
//       result = await this.aiService.analyzeCV(
//         cvText,
//         application.job.description,
//         application.job.position,
//         skills,
//       );
//     } catch (error) {
//       this.logger.error(
//         {
//           err: error,
//           message: error?.message,
//           stack: error?.stack,
//           applicationId,
//         },
//         'AI analysis failed',
//       );
//       throw error;
//     }

//     const analysis = await this.AIReportRepo.create({
//       application: {
//         connect: { id: applicationId },
//       },
//       ATSScore: result.atsScore,
//       summary: result.summary,
//       strengths: result.strengths.join('\n'),
//       weaknesses: result.weaknesses.join('\n'),
//       decision: result.decision,
//     });
//     for (const skill of result.skills) {
//       await this.AISkillMatchRepo.create({
//         report: { connect: { id: analysis.id } },
//         skillName: skill.name,
//         matchScore: skill.matchScore,
//       });
//     }
//   }

//   @OnWorkerEvent('completed')
//   handleCompleted(job: Job) {
//     this.logger.info({ jobId: job.id }, 'Job completed successfully');
//   }

//   @OnWorkerEvent('failed')
//   handleFailed(job: Job, err: Error) {
//     this.logger.error(
//       { jobId: job.id, err, message: err?.message, stack: err?.stack },
//       'Job failed',
//     );
//   }
// }
