import type { JobsOptions, Queue } from 'bullmq';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

import type {
  CampaignBatchJobData,
  SendSingleEmailJobData,
} from './email-campaign-send.types';

import {
  createCampaignJobOptions,
  EMAIL_CAMPAIGN_SEND_QUEUE_NAME,
} from './email-campaign-send.types';

@Injectable()
export class EmailCampaignQueueService {
  private readonly logger = new Logger(EmailCampaignQueueService.name);

  constructor(
    @InjectQueue(EMAIL_CAMPAIGN_SEND_QUEUE_NAME)
    private readonly queue: Queue<
      CampaignBatchJobData | SendSingleEmailJobData
    >,
  ) {}

  /**
   * Add a batch processing job to the queue
   */
  async addBatchJob(data: CampaignBatchJobData, delay?: number): Promise<void> {
    const opts = createCampaignJobOptions(data.campaignId, {
      delay,
    });

    await this.queue.add('process-campaign-batch', data, opts);

    this.logger.log(
      `Added batch job for campaign ${data.campaignId}, batch ${data.batchNumber}`,
    );
  }

  /**
   * Add multiple send jobs in bulk
   */
  async addBulkSendJobs(
    jobs: Array<{
      name: string;
      data: SendSingleEmailJobData;
      opts?: JobsOptions;
    }>,
  ): Promise<void> {
    await this.queue.addBulk(jobs);

    this.logger.log(`Added ${jobs.length} bulk send jobs`);
  }

  /**
   * Add a single email send job to the queue
   */
  async addSendJob(
    data: SendSingleEmailJobData,
    delay?: number,
  ): Promise<void> {
    const opts = createCampaignJobOptions(data.campaignId, {
      delay,
    });

    await this.queue.add('send-single-email', data, opts);

    this.logger.debug(
      `Added send job for recipient ${data.recipientId} in campaign ${data.campaignId}`,
    );
  }

  /**
   * Get all jobs for a specific campaign
   */
  async getCampaignJobs(campaignId: string) {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'delayed']);

    return jobs.filter((job) => {
      const data = job.data;
      return data.campaignId === campaignId;
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const counts = await this.queue.getJobCounts();

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    };
  }

  /**
   * Remove all jobs for a specific campaign
   */
  async removeCampaignJobs(campaignId: string): Promise<number> {
    const jobs = await this.getCampaignJobs(campaignId);

    let removed = 0;
    for (const job of jobs) {
      await job.remove();
      removed++;
    }

    if (removed > 0) {
      this.logger.log(`Removed ${removed} jobs for campaign ${campaignId}`);
    }

    return removed;
  }
}
