import type { Job } from 'bullmq';

import { HttpService } from '@nestjs/axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { SesEventHandlerService } from './ses-event-handler.service';
import {
  SES_EVENT_JOB_NAME,
  SES_SUBSCRIPTION_CONFIRMATION_JOB_NAME,
  SES_WEBHOOK_QUEUE_NAME,
  SesEventJobData,
  SubscriptionConfirmationJobData,
} from './ses-webhook.types';

@Injectable()
@Processor(SES_WEBHOOK_QUEUE_NAME)
export class SesWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(SesWebhookProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly eventHandler: SesEventHandlerService,
  ) {
    super();
  }

  async process(job: Job<SesEventJobData | SubscriptionConfirmationJobData>) {
    if (job.name === SES_SUBSCRIPTION_CONFIRMATION_JOB_NAME) {
      return this.processSubscriptionConfirmation(
        job as Job<SubscriptionConfirmationJobData>,
      );
    }

    if (job.name === SES_EVENT_JOB_NAME) {
      return this.processSesEvent(job as Job<SesEventJobData>);
    }

    this.logger.warn(`Unknown job name: ${job.name}`);
  }

  private async processSesEvent(job: Job<SesEventJobData>) {
    const { eventType, messageId } = job.data;

    this.logger.log(`Processing SES event: ${eventType} for ${messageId}`);

    try {
      // Route to appropriate handler based on event type
      await this.eventHandler.handleEvent(job.data);

      this.logger.log(
        `Successfully processed ${eventType} event for ${messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process ${eventType} event for ${messageId}`,
        error as Error,
      );
      throw error; // Re-throw for BullMQ retry
    }
  }

  private async processSubscriptionConfirmation(
    job: Job<SubscriptionConfirmationJobData>,
  ) {
    const { subscribeUrl } = job.data;

    this.logger.log('Confirming SNS subscription...');

    try {
      await firstValueFrom(
        this.httpService.get(subscribeUrl, { timeout: 10000 }),
      );
      this.logger.log('SNS subscription confirmed successfully');
    } catch (error) {
      this.logger.error('Failed to confirm SNS subscription', error as Error);
      throw error;
    }
  }
}
