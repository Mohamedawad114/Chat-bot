// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
// import { Job } from 'bullmq';
// import {
//   forwardRef,
//   Inject,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import {
//   ApplicationRepository,
//   JobRepository,
//   NotificationRepository,
//   UserRepository,
// } from 'src/common/Repositories';
// import {
//   ApplicationStatusEnum,
//   JobStatus,
//   NotificationType,
// } from 'src/common/Enum';
// import { PinoLogger } from 'nestjs-pino';
// import { notificationHandler } from 'src/common/helpers';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// @Processor('rejectedApplications')
// @Injectable()
// export class RejectedProcessor extends WorkerHost {
//   constructor(
//     private readonly applicationRepo: ApplicationRepository,
//     private readonly jobRepo: JobRepository,
//     private readonly notificationRepo: NotificationRepository,
//     private readonly userRepo: UserRepository,
//     private readonly logger: PinoLogger,
//     private readonly eventEmitter: EventEmitter2,
//   ) {
//     super();
//   }

//   async process(job: Job) {
//     switch (job.name) {
//       case 'reject_others':
//         return await this.handleRejectedApplications(job.data);
//       case 'check_job_capacity':
//         return await this.handleJobCapacity(job.data);
//       case 'job_posted':
//         return await this.JobPosted(job.data);

//       default:
//         this.logger.warn(`Unknown job name: ${job.name}`);
//         return { success: false };
//     }
//   }

  
//   private async handleRejectedApplications(data: any) {
//     const { applicationIds, jobId } = data;
//    const app = await this.applicationRepo.updateMany(
//      { id: { notIn: applicationIds }, jobId: jobId },
//      { status: ApplicationStatusEnum.REJECTED },
//    );
//     this.logger.info(app)
//     return { success: true, rejectedCount: applicationIds.length };
//   }

//   private async handleJobCapacity(data: any) {
//     const job = await this.jobRepo.findOne(
//       {
//         id: data.jobId,
//         status: JobStatus.open,
//       },
//       {
//         include: {
//           company: {
//             select: {
//               adminId: true,
//             },
//           },
//         },
//       },
//     );
//     if (!job) throw new NotFoundException('job not found |closed');
//     if (job.applicationCount >= job.maxNumApplication) {
//       const { id, position, maxNumApplication } = job;
//       const { title, content } = notificationHandler(
//         NotificationType.JOB_CAPACITY_FULL,
//         { jobTitle: position, maxCount: maxNumApplication },
//       );
//       const notification = await this.notificationRepo.insert({
//         userId: job.company.adminId,
//         title,
//         content,
//       });
//       await this.jobRepo.updateById(id, { status: JobStatus.closed });
//       this.eventEmitter.emit('notification.send', {
//         userId: job.company.adminId,
//         notification,
//       });
//       this.logger.info(`Job ${job.id} closed due to capacity limit.`);
//       return { success: true };
//     }
//     this.logger.info(`Job ${job.id} not closed .`);
//     return { success: true };
//   }
//   private async JobPosted(data: any) {
//     const users = await this.userRepo.findAll({
//       take: 20,
//       select: { id: true },
//     });
//     users.map(async (user) => {
//       const { companyName, jobPosition } = data;
//       const { title, content } = notificationHandler(
//         NotificationType.NEW_JOB_POSTED,
//         { companyName, jobTitle: jobPosition },
//       );
//       const notification = await this.notificationRepo.insert({
//         userId: user.id,
//         title,
//         content,
//       });
//       this.eventEmitter.emit('notification.send', {
//         userId: user.id,
//         notification: notification,
//       });
//     });
//   }

//   @OnWorkerEvent('completed')
//   handleCompleted(job: Job) {
//     this.logger.info(`Job ${job.id} (${job.name}) completed successfully`);
//   }
//   @OnWorkerEvent('failed')
//   handleFailed(job: Job, err: Error) {
//     this.logger.error(`Job ${job.id} failed: ${err.message}`);
//   }
// }
