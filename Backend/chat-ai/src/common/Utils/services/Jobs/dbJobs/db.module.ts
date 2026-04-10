// import { BullModule } from '@nestjs/bullmq';
// import { forwardRef, Module } from '@nestjs/common';
// import { RejectedProcessor } from './db.processor';
// import { rejectedApplicationsProducer } from './db.producer';
// import {
//   ApplicationRepository,
//   JobRepository,
//   NotificationRepository,
//   UserRepository,
// } from 'src/common/Repositories';
// import { notificationModel } from 'src/common/DB';
// @Module({
//   imports: [
//     BullModule.registerQueue({ name: 'rejectedApplications' }),
//     notificationModel,
 
//   ],
//   providers: [
//     RejectedProcessor,
//     rejectedApplicationsProducer,
//     ApplicationRepository,
//     JobRepository,
//     NotificationRepository,
//     UserRepository,
//   ],
//   exports: [rejectedApplicationsProducer],
// })
// export class rejectedApplicationsModule {}
