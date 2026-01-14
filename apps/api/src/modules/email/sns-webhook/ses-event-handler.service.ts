import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  orgEmailBounceEventsTable,
  orgEmailClickEventsTable,
  orgEmailComplaintEventsTable,
  orgEmailDeliveryDelayEventsTable,
  orgEmailDeliveryEventsTable,
  orgEmailEventsTable,
  orgEmailOpenEventsTable,
  orgEmailRejectEventsTable,
  orgEmailRenderingFailureEventsTable,
  orgEmailSendEventsTable,
  orgEmailsTable,
} from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

import { SesEventJobData, SesEventType } from './ses-webhook.types';

@Injectable()
export class SesEventHandlerService {
  private readonly logger = new Logger(SesEventHandlerService.name);

  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  async handleEvent(data: SesEventJobData) {
    const { eventType, messageId } = data;

    // Always create a base event record
    await this.createBaseEvent(data);

    // Handle specific event types
    switch (eventType) {
      case 'Send':
        await this.handleSendEvent(data);
        break;
      case 'Bounce':
        await this.handleBounceEvent(data);
        await this.updateOrgEmailStatus(messageId, 'BOUNCED');
        break;
      case 'Complaint':
        await this.handleComplaintEvent(data);
        await this.updateOrgEmailStatus(messageId, 'COMPLAINT');
        break;
      case 'Delivery':
        await this.handleDeliveryEvent(data);
        await this.updateOrgEmailStatus(messageId, 'DELIVERED');
        break;
      case 'Open':
        await this.handleOpenEvent(data);
        await this.updateOrgEmailStatus(messageId, 'OPENED');
        break;
      case 'Click':
        await this.handleClickEvent(data);
        break;
      case 'Reject':
        await this.handleRejectEvent(data);
        break;
      case 'Rendering Failure':
        await this.handleRenderingFailureEvent(data);
        break;
      case 'Delivery Delay':
        await this.handleDeliveryDelayEvent(data);
        break;
    }
  }

  private async createBaseEvent(data: SesEventJobData) {
    const eventRecord = await this.db
      .insert(orgEmailEventsTable)
      .values({
        messageId: data.messageId,
        eventType: this.normalizeEventType(data.eventType),
        rawEvent: data.sesEvent,
        eventTimestamp: data.timestamp ? new Date(data.timestamp) : undefined,
        processed: 'SUCCESS',
      })
      .returning();

    return eventRecord[0];
  }

  private async handleBounceEvent(data: SesEventJobData) {
    const bounce = (data.sesEvent as { bounce?: unknown }).bounce as
      | {
          bounceType: string;
          bounceSubType?: string;
          bouncedRecipients?: Array<{
            emailAddress: string;
            status?: string;
            diagnosticCode?: string;
          }>;
          feedbackId?: string;
          timestamp: string;
        }
      | undefined;

    if (!bounce) {
      this.logger.warn(
        `Bounce event missing bounce data for ${data.messageId}`,
      );
      return;
    }

    await this.db.insert(orgEmailBounceEventsTable).values({
      messageId: data.messageId,
      bounceType: bounce.bounceType as 'Undetermined' | 'Soft' | 'Hard',
      bounceSubType: bounce.bounceSubType ?? null,
      diagnosticCode: bounce.bouncedRecipients?.[0]?.diagnosticCode ?? null,
      recipients: bounce.bouncedRecipients ?? null,
      eventTimestamp: new Date(bounce.timestamp),
    });
  }

  private async handleClickEvent(data: SesEventJobData) {
    const click = (data.sesEvent as { click?: unknown }).click as
      | {
          link: string;
          linkTags?: string[];
          timestamp: string;
          userAgent?: string;
        }
      | undefined;

    if (!click) {
      this.logger.warn(`Click event missing click data for ${data.messageId}`);
      return;
    }

    await this.db.insert(orgEmailClickEventsTable).values({
      messageId: data.messageId,
      orgEmailId: data.orgEmailId ?? null,
      link: click.link,
      linkTags: click.linkTags ?? null,
      userAgent: click.userAgent ?? null,
      eventTimestamp: new Date(click.timestamp),
    });
  }

  private async handleComplaintEvent(data: SesEventJobData) {
    const complaint = (data.sesEvent as { complaint?: unknown }).complaint as
      | {
          complainedRecipients?: Array<{ emailAddress: string }>;
          timestamp: string;
          feedbackId?: string;
          complaintFeedbackType?: string;
          complaintFeedbackSubType?: string;
          arrivalDate?: string;
          userAgent?: string;
        }
      | undefined;

    if (!complaint) {
      this.logger.warn(
        `Complaint event missing complaint data for ${data.messageId}`,
      );
      return;
    }

    await this.db.insert(orgEmailComplaintEventsTable).values({
      messageId: data.messageId,
      complaintFeedbackType: complaint.complaintFeedbackType ?? null,
      complaintFeedbackSubType: complaint.complaintFeedbackSubType ?? null,
      arrivalDate: complaint.arrivalDate
        ? new Date(complaint.arrivalDate)
        : null,
      recipients: complaint.complainedRecipients ?? null,
      userAgent: complaint.userAgent ?? null,
      complaintFeedbackId: complaint.feedbackId ?? null,
      eventTimestamp: new Date(complaint.timestamp),
    });
  }

  private async handleDeliveryDelayEvent(data: SesEventJobData) {
    const delay = (data.sesEvent as { deliveryDelay?: unknown })
      .deliveryDelay as
      | {
          delayType?: string;
          recipients?: string[];
          delaySeconds?: number;
          timestamp: string;
        }
      | undefined;

    if (!delay) {
      this.logger.warn(
        `Delivery Delay event missing delay data for ${data.messageId}`,
      );
      return;
    }

    await this.db.insert(orgEmailDeliveryDelayEventsTable).values({
      messageId: data.messageId,
      delayType: delay.delayType ?? null,
      recipients: delay.recipients ?? null,
      delaySeconds: delay.delaySeconds?.toString() ?? null,
      eventTimestamp: new Date(delay.timestamp),
    });
  }

  private async handleDeliveryEvent(data: SesEventJobData) {
    const delivery = (data.sesEvent as { delivery?: unknown }).delivery as
      | {
          recipients?: string[];
          processingTimeMillis?: number;
          timestamp: string;
          reportingMTA?: string;
          smtpResponse?: string;
        }
      | undefined;

    if (!delivery) {
      this.logger.warn(
        `Delivery event missing delivery data for ${data.messageId}`,
      );
      return;
    }

    await this.db.insert(orgEmailDeliveryEventsTable).values({
      messageId: data.messageId,
      status: null,
      processingTimeMillis: delivery.processingTimeMillis?.toString() ?? null,
      smtpResponse: delivery.smtpResponse ?? null,
      reportingMta: delivery.reportingMTA ?? null,
      recipients: delivery.recipients ?? null,
      eventTimestamp: new Date(delivery.timestamp),
    });
  }

  private async handleOpenEvent(data: SesEventJobData) {
    const open = (data.sesEvent as { open?: unknown }).open as
      | {
          timestamp: string;
          userAgent?: string;
          ipAddress?: string;
        }
      | undefined;

    if (!open) {
      this.logger.warn(`Open event missing open data for ${data.messageId}`);
      return;
    }

    await this.db.insert(orgEmailOpenEventsTable).values({
      messageId: data.messageId,
      orgEmailId: data.orgEmailId ?? null,
      ipAddress: open.ipAddress ?? null,
      userAgent: open.userAgent ?? null,
      eventTimestamp: new Date(open.timestamp),
    });
  }

  private async handleRejectEvent(data: SesEventJobData) {
    const reject = (data.sesEvent as { reject?: unknown }).reject as
      | {
          reason: string;
          timestamp: string;
        }
      | undefined;

    if (!reject) {
      this.logger.warn(
        `Reject event missing reject data for ${data.messageId}`,
      );
      return;
    }

    await this.db.insert(orgEmailRejectEventsTable).values({
      messageId: data.messageId,
      reason: reject.reason,
      eventTimestamp: new Date(reject.timestamp),
    });
  }

  private async handleRenderingFailureEvent(data: SesEventJobData) {
    const failure = (data.sesEvent as { failure?: unknown }).failure as
      | {
          errorMessage: string;
          templateName?: string;
          timestamp: string;
        }
      | undefined;

    if (!failure) {
      this.logger.warn(
        `Rendering Failure event missing failure data for ${data.messageId}`,
      );
      return;
    }

    await this.db.insert(orgEmailRenderingFailureEventsTable).values({
      messageId: data.messageId,
      templateName: failure.templateName ?? null,
      errorMessage: failure.errorMessage,
      eventTimestamp: new Date(failure.timestamp),
    });
  }

  private async handleSendEvent(data: SesEventJobData) {
    const send = (data.sesEvent as { send?: unknown }).send as
      | {
          timestamp?: string;
          sendingAccountId?: string;
          recipientCount?: number;
        }
      | undefined;

    if (!send) {
      this.logger.warn(`Send event missing send data for ${data.messageId}`);
      return;
    }

    await this.db.insert(orgEmailSendEventsTable).values({
      messageId: data.messageId,
      sendingAccountId: send.sendingAccountId ?? null,
      recipientCount: send.recipientCount?.toString() ?? null,
      eventTimestamp: send.timestamp
        ? new Date(send.timestamp)
        : new Date(data.timestamp),
    });
  }

  /**
   * Normalize SES event type to match database enum (uppercase)
   * SES sends: "Send", "Reject", "Bounce", etc.
   * DB expects: "SEND", "REJECT", "BOUNCE", etc.
   */
  private normalizeEventType(
    eventType: SesEventType,
  ):
    | 'SEND'
    | 'RENDERING_FAILURE'
    | 'REJECT'
    | 'DELIVERY'
    | 'BOUNCE'
    | 'COMPLAINT'
    | 'DELIVERY_DELAY'
    | 'OPEN'
    | 'CLICK' {
    const normalized = eventType.toUpperCase();
    return normalized as
      | 'SEND'
      | 'RENDERING_FAILURE'
      | 'REJECT'
      | 'DELIVERY'
      | 'BOUNCE'
      | 'COMPLAINT'
      | 'DELIVERY_DELAY'
      | 'OPEN'
      | 'CLICK';
  }

  private async updateOrgEmailStatus(
    messageId: string,
    status: 'BOUNCED' | 'COMPLAINT' | 'DELIVERED' | 'OPENED',
  ) {
    await this.db
      .update(orgEmailsTable)
      .set({ status })
      .where(eq(orgEmailsTable.messageId, messageId));
  }
}
