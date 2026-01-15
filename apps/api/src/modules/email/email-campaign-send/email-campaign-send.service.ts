import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  orgContactsTable,
  orgEmailCampaignRecipientsTable,
  orgEmailCampaignsTable,
  orgEmailDomainsTable,
} from '@repo/database/schema';
import { and, eq, sql } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

import { EmailCampaignQueueService } from './email-campaign-send.queue';

export interface ContactMatchOptions {
  targetTags?: string[];
  targetCategories?: string[];
  tagMatchType?: 'ALL' | 'ANY';
}

export interface SendCampaignOptions {
  campaignId: string;
  organizationId: string;
}

@Injectable()
export class EmailCampaignSendService {
  private readonly logger = new Logger(EmailCampaignSendService.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly campaignQueueService: EmailCampaignQueueService,
  ) {}

  /**
   * Cancel a campaign
   */
  async cancelCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<void> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (campaign.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed campaign');
    }

    // Remove pending jobs
    await this.campaignQueueService.removeCampaignJobs(campaignId);

    // Update campaign status
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        status: 'CANCELLED',
        cancelledAt: new Date(),
        completedAt: campaign.completedAt ?? new Date(),
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    this.logger.log(`Campaign ${campaignId} cancelled`);
  }

  /**
   * Create recipient records for a campaign
   */
  async createRecipientRecords(
    campaignId: string,
    organizationId: string,
    options?: ContactMatchOptions,
  ): Promise<number> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Get matched contacts
    const contacts = await this.getMatchedContacts(organizationId, {
      targetTags: campaign.targetTags ?? undefined,
      targetCategories: campaign.targetCategories ?? undefined,
      tagMatchType: (campaign.tagMatchType as 'ALL' | 'ANY') ?? 'ALL',
      ...options,
    });

    if (contacts.length === 0) {
      this.logger.warn(`No contacts matched for campaign ${campaignId}`);
      return 0;
    }

    // Get existing recipient count to avoid duplicates
    const existingRecipients =
      await this.db.query.orgEmailCampaignRecipientsTable.findMany({
        where: eq(
          orgEmailCampaignRecipientsTable.orgEmailCampaignId,
          campaignId,
        ),
        columns: { crmContactId: true },
      });

    const existingContactIds = new Set(
      existingRecipients
        .map((r) => r.crmContactId)
        .filter((id): id is string => id !== null),
    );

    // Filter out contacts that already have recipient records
    const newContacts = contacts.filter((c) => !existingContactIds.has(c.id));

    if (newContacts.length === 0) {
      this.logger.log(
        `All contacts already have recipient records for campaign ${campaignId}`,
      );
      return contacts.length;
    }

    // Create recipient records
    const recipientRecords = newContacts.map((contact) => ({
      orgEmailCampaignId: campaignId,
      organizationId,
      crmContactId: contact.id,
      email: contact.email,
      status: 'PENDING' as const,
      isTest: false,
    }));

    await this.db
      .insert(orgEmailCampaignRecipientsTable)
      .values(recipientRecords);

    // Update campaign total recipients
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        totalRecipients: contacts.length,
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    this.logger.log(
      `Created ${newContacts.length} recipient records for campaign ${campaignId}`,
    );

    return contacts.length;
  }

  /**
   * Get contacts that match the campaign criteria
   */
  async getMatchedContacts(
    organizationId: string,
    options: ContactMatchOptions,
  ): Promise<Array<{ id: string; email: string }>> {
    const { targetTags, targetCategories, tagMatchType = 'ALL' } = options;

    // Build conditions
    const conditions = [
      eq(orgContactsTable.organizationId, organizationId),
      // Only contacts who have opted in to emails
      eq(orgContactsTable.emailOptIn, true),
    ];

    // Add tag filter
    if (targetTags && targetTags.length > 0) {
      if (tagMatchType === 'ALL') {
        // ALL tags must be present (contains operator)
        conditions.push(sql`${orgContactsTable.tags} @> ${targetTags}`);
      } else {
        // ANY tag can be present (overlap operator)
        conditions.push(sql`${orgContactsTable.tags} && ${targetTags}`);
      }
    }

    // Add category filter (any category matches)
    if (targetCategories && targetCategories.length > 0) {
      conditions.push(
        sql`${orgContactsTable.categories} && ${targetCategories}`,
      );
    }

    const contacts = await this.db.query.orgContactsTable.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        email: true,
      },
    });

    return contacts as Array<{ id: string; email: string }>;
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<void> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (campaign.status !== 'SENDING') {
      throw new Error(`Cannot pause campaign with status: ${campaign.status}`);
    }

    // Remove pending jobs
    await this.campaignQueueService.removeCampaignJobs(campaignId);

    // Update campaign status
    await this.db
      .update(orgEmailCampaignsTable)
      .set({ status: 'PAUSED' })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    this.logger.log(`Campaign ${campaignId} paused`);
  }

  /**
   * Resume a paused campaign
   */
  async resumeCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<void> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (campaign.status !== 'PAUSED') {
      throw new Error(`Cannot resume campaign with status: ${campaign.status}`);
    }

    if (!campaign.orgEmailDomainId) {
      throw new Error(`Campaign ${campaignId} has no email domain configured`);
    }

    // Update campaign status back to SENDING
    await this.db
      .update(orgEmailCampaignsTable)
      .set({ status: 'SENDING' })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    // Queue next batch
    await this.campaignQueueService.addBatchJob({
      campaignId,
      organizationId,
      domainId: campaign.orgEmailDomainId,
      batchNumber: (campaign.sentCount ?? 0) / 100 + 1, // Approximate batch number
    });

    this.logger.log(`Campaign ${campaignId} resumed`);
  }

  /**
   * Schedule a campaign for future sending
   */
  async scheduleCampaign(
    campaignId: string,
    organizationId: string,
    scheduledFor: Date,
  ): Promise<void> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (campaign.status !== 'DRAFT') {
      throw new Error(
        `Can only schedule draft campaigns (current: ${campaign.status})`,
      );
    }

    if (!campaign.orgEmailDomainId) {
      throw new Error(`Campaign ${campaignId} has no email domain configured`);
    }

    if (scheduledFor <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    // Create recipient records now (snapshot of contacts)
    await this.createRecipientRecords(campaignId, organizationId);

    // Update campaign status
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        status: 'SCHEDULED',
        scheduledFor,
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    // Queue delayed job for scheduled time
    const delay = scheduledFor.getTime() - Date.now();
    await this.campaignQueueService.addBatchJob(
      {
        campaignId,
        organizationId,
        domainId: campaign.orgEmailDomainId,
        batchNumber: 1,
      },
      delay,
    );

    this.logger.log(
      `Campaign ${campaignId} scheduled for ${scheduledFor.toISOString()}`,
    );
  }

  /**
   * Send test emails
   */
  async sendTestEmails(
    campaignId: string,
    organizationId: string,
    testEmails: string[],
    testReceiverId?: string,
  ): Promise<void> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (!campaign.orgEmailDomainId) {
      throw new Error(`Campaign ${campaignId} has no email domain configured`);
    }

    // Get domain
    const domain = await this.db.query.orgEmailDomainsTable.findFirst({
      where: eq(orgEmailDomainsTable.id, campaign.orgEmailDomainId),
    });

    if (!domain) {
      throw new Error(`Domain not found: ${campaign.orgEmailDomainId}`);
    }

    if (domain.status !== 'READY') {
      throw new Error(
        `Domain ${domain.name} is not ready (status: ${domain.status})`,
      );
    }

    // Create test recipient records
    const recipientRecords = testEmails.map((email) => ({
      orgEmailCampaignId: campaignId,
      organizationId,
      email,
      status: 'PENDING' as const,
      isTest: true,
    }));

    const recipients = await this.db
      .insert(orgEmailCampaignRecipientsTable)
      .values(recipientRecords)
      .returning();

    // Update campaign with test receiver ID
    if (testReceiverId) {
      await this.db
        .update(orgEmailCampaignsTable)
        .set({ orgEmailTestReceiverId: testReceiverId })
        .where(eq(orgEmailCampaignsTable.id, campaignId));
    }

    // Queue test emails
    for (const recipient of recipients) {
      await this.campaignQueueService.addSendJob({
        campaignId,
        organizationId,
        domainId: domain.id,
        recipientId: recipient.id,
        contactId: null,
        email: recipient.email ?? '',
        subject: campaign.subject ?? '',
        body: campaign.body ?? '',
        isTest: true,
      });
    }

    this.logger.log(
      `Sent ${testEmails.length} test emails for campaign ${campaignId}`,
    );
  }

  /**
   * Start sending a campaign
   */
  async startCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<void> {
    const campaign = await this.db.query.orgEmailCampaignsTable.findFirst({
      where: and(
        eq(orgEmailCampaignsTable.id, campaignId),
        eq(orgEmailCampaignsTable.organizationId, organizationId),
      ),
    });

    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    if (!campaign.orgEmailDomainId) {
      throw new Error(`Campaign ${campaignId} has no email domain configured`);
    }

    // Get domain to verify status
    const domain = await this.db.query.orgEmailDomainsTable.findFirst({
      where: eq(orgEmailDomainsTable.id, campaign.orgEmailDomainId),
    });

    if (!domain) {
      throw new Error(`Domain not found: ${campaign.orgEmailDomainId}`);
    }

    if (domain.status !== 'READY') {
      throw new Error(
        `Domain ${domain.name} is not ready (status: ${domain.status})`,
      );
    }

    // Create recipient records if not already created
    const recipientCount = await this.createRecipientRecords(
      campaignId,
      organizationId,
    );

    if (recipientCount === 0) {
      throw new Error('No recipients to send to');
    }

    // Update campaign status to SENDING
    await this.db
      .update(orgEmailCampaignsTable)
      .set({
        status: 'SENDING',
        startedAt: new Date(),
      })
      .where(eq(orgEmailCampaignsTable.id, campaignId));

    // Queue first batch
    await this.campaignQueueService.addBatchJob({
      campaignId,
      organizationId,
      domainId: domain.id,
      batchNumber: 1,
    });

    this.logger.log(
      `Campaign ${campaignId} started with ${recipientCount} recipients`,
    );
  }
}
