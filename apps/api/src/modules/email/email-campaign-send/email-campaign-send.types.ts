import type { JobsOptions } from 'bullmq';

export const EMAIL_CAMPAIGN_SEND_QUEUE_NAME = 'email-campaign-send';

// Job names
export const PROCESS_CAMPAIGN_BATCH_JOB_NAME = 'process-campaign-batch';
export const SEND_SINGLE_EMAIL_JOB_NAME = 'send-single-email';

// Job data types
export interface CampaignBatchJobData {
  campaignId: string;
  organizationId: string;
  domainId: string;
  batchNumber: number;
}

export interface SendSingleEmailJobData {
  campaignId: string;
  organizationId: string;
  domainId: string;
  recipientId: string;
  contactId: string | null;
  email: string;
  subject: string;
  body: string;
  isTest: boolean;
}

// Job options factory
export function createCampaignJobOptions(
  _campaignId: string,
  opts?: Partial<JobsOptions>,
): JobsOptions {
  return {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
    ...opts,
  };
}
