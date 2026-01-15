import {
  SendEmailCommand,
  type SendEmailCommandInput,
  type SendEmailCommandOutput,
} from '@aws-sdk/client-ses';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Db } from '@repo/database';
import { type OrgEmail, orgEmailsTable } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { AWS_SES, DRIZZLE_DB } from '~/constants/provider';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  fromDomain: string;
  organizationId: string;
  ownerId?: string;
  emailCampaignId?: string;
  crmContactId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  email?: OrgEmail;
}

@Injectable()
export class SesEmailService {
  private readonly logger = new Logger(SesEmailService.name);

  constructor(
    @Inject(AWS_SES)
    private readonly ses: {
      send: (cmd: SendEmailCommand) => Promise<SendEmailCommandOutput>;
    },
    @Inject(DRIZZLE_DB) private readonly db: Db,
  ) {}

  /**
   * Create an email record in the database
   */
  async createEmailRecord(params: {
    messageId: string;
    subject: string;
    body: string;
    organizationId: string;
    ownerId?: string;
    emailCampaignId?: string;
    emailDomainId?: string;
    crmContactId?: string;
    status: 'SENT' | 'DELIVERED' | 'BOUNCED' | 'OPENED' | 'COMPLAINT';
  }): Promise<OrgEmail> {
    const records = await this.db
      .insert(orgEmailsTable)
      .values({
        messageId: params.messageId,
        subject: params.subject,
        body: params.body,
        organizationId: params.organizationId,
        ownerId: params.ownerId,
        emailCampaignId: params.emailCampaignId,
        emailDomainId: params.emailDomainId,
        crmContactId: params.crmContactId,
        status: params.status,
      })
      .returning();

    const emailRecord = records[0];
    if (!emailRecord) {
      throw new Error('Failed to create email record');
    }

    return emailRecord;
  }

  /**
   * Get email by message ID
   */
  async getEmailByMessageId(messageId: string): Promise<OrgEmail | undefined> {
    return await this.db.query.orgEmailsTable.findFirst({
      where: eq(orgEmailsTable.messageId, messageId),
    });
  }

  /**
   * Send an email via AWS SES
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const {
      to,
      subject,
      html,
      fromDomain,
      organizationId,
      ownerId,
      emailCampaignId,
      crmContactId,
    } = params;

    // Normalize recipient addresses
    const toAddresses = Array.isArray(to) ? to : [to];

    // Build the from address using the domain
    // For now, we'll use a default format. In production, this should be
    // configured per domain or organization.
    const fromAddress = `noreply@${fromDomain}`;

    try {
      // Send via SES
      const sesParams: SendEmailCommandInput = {
        Source: fromAddress,
        Destination: {
          ToAddresses: toAddresses,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          },
        },
      };

      const command = new SendEmailCommand(sesParams);
      const response: SendEmailCommandOutput = await this.ses.send(command);

      const messageId = response.MessageId;

      if (!messageId) {
        throw new Error('No message ID returned from SES');
      }

      this.logger.log(
        `Email sent successfully via SES. MessageId: ${messageId}`,
      );

      // Create email record in database
      const emailRecord = await this.createEmailRecord({
        messageId,
        subject,
        body: html,
        organizationId,
        ownerId,
        emailCampaignId,
        emailDomainId: undefined, // This will be set by the caller if needed
        crmContactId,
        status: 'SENT',
      });

      return {
        success: true,
        messageId,
        email: emailRecord,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email via SES: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Update email status
   */
  async updateEmailStatus(
    messageId: string,
    status: 'SENT' | 'DELIVERED' | 'BOUNCED' | 'OPENED' | 'COMPLAINT',
  ): Promise<void> {
    await this.db
      .update(orgEmailsTable)
      .set({ status })
      .where(eq(orgEmailsTable.messageId, messageId));
  }
}
