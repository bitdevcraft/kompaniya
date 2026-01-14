import type { JobsOptions, Queue } from 'bullmq';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export const EMAIL_DOMAIN_VERIFICATION_QUEUE_NAME = 'email-domain-verification';
export const EMAIL_DOMAIN_VERIFICATION_JOB_NAME = 'verify-email-domains';

type EmailDomainVerificationJobData = Record<string, never>;

@Injectable()
export class EmailDomainVerificationQueueService implements OnModuleInit {
  private readonly logger = new Logger(
    EmailDomainVerificationQueueService.name,
  );

  constructor(
    @InjectQueue(EMAIL_DOMAIN_VERIFICATION_QUEUE_NAME)
    private readonly queue: Queue<EmailDomainVerificationJobData>,
  ) {}

  async onModuleInit() {
    await this.ensureRepeatableJob();
  }

  private async ensureRepeatableJob() {
    const existing = await this.queue.getRepeatableJobs();
    const hasJob = existing.some(
      (job) => job.name === EMAIL_DOMAIN_VERIFICATION_JOB_NAME,
    );

    if (hasJob) {
      return;
    }

    const options: JobsOptions = {
      repeat: { pattern: '* * * * *' },
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
      removeOnComplete: 10,
      removeOnFail: 50,
      jobId: EMAIL_DOMAIN_VERIFICATION_JOB_NAME,
    };

    await this.queue.add(EMAIL_DOMAIN_VERIFICATION_JOB_NAME, {}, options);

    this.logger.log('Scheduled email domain verification job.');
  }
}
