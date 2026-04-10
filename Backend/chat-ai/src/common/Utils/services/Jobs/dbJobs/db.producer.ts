// import { Injectable } from '@nestjs/common';
// import { Queue } from 'bullmq';
// import { InjectQueue } from '@nestjs/bullmq';
// import { IJob } from 'src/common/Interfaces';

// @Injectable()
// export class rejectedApplicationsProducer {
//   constructor(
//     @InjectQueue('rejectedApplications') private readonly dbQueue: Queue,
//   ) {}
//   async sendRejectedApplications(setOfApplyIds: number[], jobId: number) {
//     await this.dbQueue.add(
//       'reject_others',
//       {
//         applicationIds: setOfApplyIds,
//         jobId: jobId,
//       },
//       {
//         attempts: 1,
//         removeOnFail: false,
//         removeOnComplete: true,
//       },
//     );
//   }
//   async changeJobStatus(jobId: number) {
//     await this.dbQueue.add('check_job_capacity', {
//       jobId: jobId,
//     });
//   }
//   async JobPosted(companyName: string, jobPosition: string) {
//     await this.dbQueue.add('job_posted', {
//       companyName: companyName,
//       jobPosition: jobPosition,
//     });
//   }
// }
