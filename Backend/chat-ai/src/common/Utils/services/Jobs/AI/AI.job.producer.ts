// import { Injectable } from '@nestjs/common';
// import { Queue } from 'bullmq';
// import { InjectQueue } from '@nestjs/bullmq';

// @Injectable()
// export class AIPAnalysisProducer {
//   constructor(@InjectQueue('AIAnalysis') private readonly AIQueue: Queue) {}
//   analysis = async (applicationId: number) => {
//     await this.AIQueue.add(
//       'AIAnalysis',
//       {
//         applicationId: applicationId,
//       },
//       {
//         attempts: 1,
//         removeOnFail: false,
//         removeOnComplete: true,
//       },
//     );
//   };
// }
