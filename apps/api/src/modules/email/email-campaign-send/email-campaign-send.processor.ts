import type { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  orgEmailCampaignRecipientsTable,
  orgEmailCampaignsTable,
  orgEmailDomainsTable,
} from '@repo/database/schema';
import { and, eq, sql } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

import type {
  CampaignBatchJobData,
  SendSingleEmailJobData,
} from './email-campaign-send.types';

import { DomainWarmupService } from '../domain-warmup/domain-warmup.service';
import { SesEmailService } from '../ses-email/ses-email.service';
import { EmailCampaignQueueService } from './email-campaign-send.queue';
import {
  PROCESS_CAMPAIGN_BATCH_JOB_NAME,
  SEND_SINGLE_EMAIL_JOB_NAME,
} from './email-campaign-send.types';

@Injectable()
@Processor('email-campaign-send')
export class EmailCampaignSendProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailCampaignSendProcessor.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly sesEmailService: SesEmailService,
    private readonly domainWarmupService: DomainWarmupService,
    private readonly campaignQueueService: EmailCampaignQueueService,
  ) {
    super();
  }

  async process(job: Job<CampaignBatchJobData | SendSingleEmailJobData>) {
    const { name } = job;

    switch (name) {
      case PROCESS_CAMPAIGN_BATCH_JOB_NAME:
        await this.processCampaignBatch(job as Job<CampaignBatchJobData>);
        break;
      case SEND_SINGLE_EMAIL_JOB_NAME:
        await this.sendSingleEmail(job as Job<SendSingleEmailJobData>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${name}`);
    }
  }

  /**
   * Complete a campaign
   */
  private async completeCampaign(campaignId: string): Promise<void> {
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    this.logger.log(`Campaign ${campaignId} completed`);
  }

  /**
   * Fail a campaign
   */
  private async failCampaign(
    campaignId: string,
    reason: string,
  ): Promise<void> {
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        status: 'FAILED',
        completedAt: new Date(),
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    this.logger.error(`Campaign ${campaignId} failed: ${reason}`);
  }

  /**
   * Pause a campaign
   */
  private async pauseCampaign(
    campaignId: string,
    reason?: string,
  ): Promise<void> {
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        status: 'PAUSED',
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    this.logger.log(
      `Campaign ${campaignId} paused${reason ? `: ${reason}` : ''}`,
    );
  }

  /**
   * Process a batch of campaign recipients
   * This checks domain capacity and sends as many emails as allowed
   */
  private async processCampaignBatch(job: Job<CampaignBatchJobData>) {
    const { campaignId, organizationId, domainId, batchNumber } = job.data;

    this.logger.log(
      `Processing batch ${batchNumber} for campaign ${campaignId}`,
    );

    // Get the campaign to verify status
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      this.logger.error(`Campaign not found: ${campaignId}`);
      return;
    }

    // Check if campaign is still in sending state
    if (campaign.status !== 'SENDING') {
      this.logger.log(
        `Campaign ${campaignId} is not in SENDING status (current: ${campaign.status}), skipping batch`,
      );
      return;
    }

    // Get the domain to verify status
    const domain = await this.db.query.orgEmailDomainsTable.findFirst({
      where: eq(orgEmailDomainsTable.id, domainId),
    });

    if (!domain) {
      this.logger.error(`Domain not found: ${domainId}`);
      await this.failCampaign(campaignId, 'Domain not found');
      return;
    }

    if (domain.status === 'BLOCKED') {
      this.logger.warn(`Domain ${domainId} is blocked, pausing campaign`);
      await this.pauseCampaign(campaignId, 'Domain is blocked');
      return;
    }

    // Get daily capacity
    const capacity = await this.domainWarmupService.getDailyCapacity(domainId);

    if (capacity.remaining <= 0) {
      this.logger.log(
        `Daily limit reached for domain ${domainId}, scheduling next batch for tomorrow`,
      );

      // Schedule next batch for tomorrow
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      const delay = tomorrow.getTime() - Date.now();
      await job.moveToDelayed(Date.now() + delay);
      return;
    }

    // Get pending recipients up to capacity
    const recipients =
      await this.db.query.orgEmailCampaignRecipientsTable.findMany({
        where: and(
          eq(orgEmailCampaignRecipientsTable.orgEmailCampaignId, campaignId),
          eq(orgEmailCampaignRecipientsTable.status, 'PENDING'),
          eq(orgEmailCampaignRecipientsTable.isTest, false), // Test emails don't count toward limits
        ),
        limit: capacity.remaining,
      });

    if (recipients.length === 0) {
      this.logger.log(
        `No more recipients to process for campaign ${campaignId}`,
      );

      // Check if there are any failed recipients
      await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orgEmailCampaignRecipientsTable)
        .where(
          and(
            eq(orgEmailCampaignRecipientsTable.orgEmailCampaignId, campaignId),
            eq(orgEmailCampaignRecipientsTable.status, 'FAILED'),
          ),
        );

      // Mark campaign as completed
      await this.completeCampaign(campaignId);
      return;
    }

    this.logger.log(
      `Sending ${recipients.length} emails for campaign ${campaignId} (remaining capacity: ${capacity.remaining})`,
    );

    // Send emails to recipients
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const result = await this.sesEmailService.sendEmail({
          to: recipient.email,
          subject: campaign.subject ?? '',
          html: campaign.body ?? '',
          fromDomain: domain.name ?? '',
          organizationId,
          emailCampaignId: campaignId,
          crmContactId: recipient.crmContactId ?? undefined,
        });

        if (result.success && result.email) {
          // Update recipient record
          await this.db
            .update(orgEmailCampaignRecipientsTable)
            .set({
              status: 'SENT',
              sentAt: new Date(),
              queuedAt: recipient.queuedAt ?? new Date(),
              orgEmailId: result.email.id,
              batchNumber,
            })
            .where(eq(orgEmailCampaignRecipientsTable.id, recipient.id));

          // Record sent email for warm-up tracking
          await this.domainWarmupService.recordSentEmail(
            domainId,
            result.email.id,
          );

          // Update campaign sent count
          await this.db
            .update(orgEmailCampaignsTable)
            .set({
              sentCount: sql<number>`${orgEmailCampaignsTable.sentCount} + 1`,
            })
            .where(eq(orgEmailCampaignsTable.id, campaignId));

          sent++;
        } else {
          // Mark as failed
          await this.db
            .update(orgEmailCampaignRecipientsTable)
            .set({
              status: 'FAILED',
              failedAt: new Date(),
              failureReason: result.error ?? 'Unknown error',
            })
            .where(eq(orgEmailCampaignRecipientsTable.id, recipient.id));

          failed++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${recipient.email}: ${error instanceof Error ? error.message : String(error)}`,
        );

        await this.db
          .update(orgEmailCampaignRecipientsTable)
          .set({
            status: 'FAILED',
            failedAt: new Date(),
            failureReason:
              error instanceof Error ? error.message : String(error),
          })
          .where(eq(orgEmailCampaignRecipientsTable.id, recipient.id));

        failed++;
      }
    }

    this.logger.log(
      `Batch ${batchNumber} complete: ${sent} sent, ${failed} failed`,
    );

    // Check if there are more recipients to process
    const remainingCount = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orgEmailCampaignRecipientsTable)
      .where(
        and(
          eq(orgEmailCampaignRecipientsTable.orgEmailCampaignId, campaignId),
          eq(orgEmailCampaignRecipientsTable.status, 'PENDING'),
          eq(orgEmailCampaignRecipientsTable.isTest, false),
        ),
      );

    if (remainingCount[0]?.count ?? 0 > 0) {
      const capacityAfter =
        await this.domainWarmupService.getDailyCapacity(domainId);

      let delay = 0;
      if (capacityAfter.remaining <= 0) {
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        delay = Math.max(0, tomorrow.getTime() - Date.now());
      }

      await this.campaignQueueService.addBatchJob(
        {
          campaignId,
          organizationId,
          domainId,
          batchNumber: batchNumber + 1,
        },
        delay,
      );

      this.logger.log(
        `Scheduled next batch ${batchNumber + 1} for campaign ${campaignId}`,
      );
    }
  }

  /**
   * Send a single email
   */
  private async sendSingleEmail(job: Job<SendSingleEmailJobData>) {
    const {
      campaignId,
      organizationId,
      domainId,
      recipientId,
      contactId,
      email,
      subject,
      body,
      isTest,
    } = job.data;

    this.logger.debug(
      `Sending single email to ${email} for campaign ${campaignId}`,
    );

    try {
      // Get domain
      const domain = await this.db.query.orgEmailDomainsTable.findFirst({
        where: eq(orgEmailDomainsTable.id, domainId),
      });

      if (!domain) {
        throw new Error(`Domain not found: ${domainId}`);
      }

      if (domain.status === 'BLOCKED') {
        throw new Error(`Domain ${domainId} is blocked`);
      }

      // Send email
      const result = await this.sesEmailService.sendEmail({
        to: email,
        subject,
        html: body,
        fromDomain: domain.name ?? '',
        organizationId,
        emailCampaignId: campaignId,
        crmContactId: contactId ?? undefined,
      });

      if (result.success && result.email) {
        // Update recipient record
        await this.db
          .update(orgEmailCampaignRecipientsTable)
          .set({
            status: 'SENT',
            sentAt: new Date(),
            orgEmailId: result.email.id,
          })
          .where(eq(orgEmailCampaignRecipientsTable.id, recipientId));

        // Record sent email (unless it's a test email)
        if (!isTest) {
          await this.domainWarmupService.recordSentEmail(
            domainId,
            result.email.id,
          );
        }

        this.logger.debug(`Successfully sent email to ${email}`);
      } else {
        throw new Error(result.error ?? 'Failed to send email');
      }
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${email}: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Update recipient as failed
      await this.db
        .update(orgEmailCampaignRecipientsTable)
        .set({
          status: 'FAILED',
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : String(error),
        })
        .where(eq(orgEmailCampaignRecipientsTable.id, recipientId));

      throw error; // Re-throw to trigger job retry
    }
  }
}
