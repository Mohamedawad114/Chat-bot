import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ApplicationStatusEnum } from 'src/common/Enum';

@Injectable()
export class EmailProducer {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}
  sendEmailJob = async (
    type: string,
    to: string,
    companyName?: string,
    jobName?: string,
  ) => {
    await this.emailQueue.add(
      type,
      {
        to,
        companyName,
        jobName,
        status: ApplicationStatusEnum.ACCEPTED,
      },
      {
        attempts: 3,
        removeOnFail: false,
        removeOnComplete: true,
      },
    );
  };
}
