import type { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

import { AwsSesVerificationService } from '../aws-ses-verification/aws-ses-verification.service';
import {
  EMAIL_DOMAIN_VERIFICATION_JOB_NAME,
  EMAIL_DOMAIN_VERIFICATION_QUEUE_NAME,
} from './email-domain-verification.queue';

@Injectable()
@Processor(EMAIL_DOMAIN_VERIFICATION_QUEUE_NAME)
export class EmailDomainVerificationProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailDomainVerificationProcessor.name);

  constructor(private readonly awsSesVerification: AwsSesVerificationService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== EMAIL_DOMAIN_VERIFICATION_JOB_NAME) {
      this.logger.warn(`Unknown job name: ${job.name}`);
      return;
    }

    this.logger.log(`Running email domain verification job (${job.id}).`);
    await this.awsSesVerification.updateIdentities();
  }
}
