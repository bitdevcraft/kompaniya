import type { JobsOptions, Queue } from 'bullmq';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

import {
  SesEventJobData,
  SubscriptionConfirmationJobData,
} from './ses-webhook.types';

export const SES_WEBHOOK_QUEUE_NAME = 'ses-webhook';
export const SES_EVENT_JOB_NAME = 'process-ses-event';
export const SES_SUBSCRIPTION_CONFIRMATION_JOB_NAME =
  'confirm-sns-subscription';

@Injectable()
export class SesWebhookQueueService {
  private readonly logger = new Logger(SesWebhookQueueService.name);

  constructor(
    @InjectQueue(SES_WEBHOOK_QUEUE_NAME)
    private readonly queue: Queue<
      SesEventJobData | SubscriptionConfirmationJobData
    >,
  ) {}

  async addSesEventJob(data: SesEventJobData) {
    const options: JobsOptions = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    };

    await this.queue.add(SES_EVENT_JOB_NAME, data, options);

    this.logger.debug(`Queued SES event job for ${data.messageId}`);
  }

  async confirmSubscription(subscribeUrl: string) {
    const options: JobsOptions = {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 10,
      removeOnFail: 50,
      delay: 1000, // Small delay before processing
    };

    await this.queue.add(
      SES_SUBSCRIPTION_CONFIRMATION_JOB_NAME,
      { subscribeUrl },
      options,
    );

    this.logger.log('Queued SNS subscription confirmation job');
  }
}
