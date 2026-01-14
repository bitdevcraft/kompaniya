import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Db } from '@repo/database';
import { orgEmailsTable } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

import {
  type SnsMessageType,
  type SnsNotificationMessage,
  type SnsSubscriptionConfirmationMessage,
  type SnsUnsubscribeConfirmationMessage,
} from './dto/sns-message.dto';
import { SesWebhookQueueService } from './ses-webhook-queue.service';
import { SnsSignatureVerifierService } from './sns-signature-verifier.service';

@Injectable()
export class SnsWebhookService {
  private readonly logger = new Logger(SnsWebhookService.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly signatureVerifier: SnsSignatureVerifierService,
    private readonly webhookQueue: SesWebhookQueueService,
  ) {}

  async processSnsMessage(message: SnsMessageType, rawBody: string) {
    // Verify SNS signature first using the raw body
    // sns-validator needs the raw parsed JSON, not the Zod-transformed object
    const isValid = await this.signatureVerifier.verifySignature(rawBody);
    if (!isValid) {
      this.logger.warn('Rejecting webhook with invalid signature');
      throw new Error('Invalid signature');
    }

    // Handle different SNS message types
    if (message.Type === 'SubscriptionConfirmation') {
      return this.handleSubscriptionConfirmation(message);
    }

    if (message.Type === 'UnsubscribeConfirmation') {
      return this.handleUnsubscribeConfirmation(message);
    }

    if (message.Type === 'Notification') {
      return this.handleNotification(message);
    }

    // All message types are covered by the discriminated union
  }

  private async handleNotification(message: SnsNotificationMessage) {
    const sesEvent = message.Message;

    this.logger.log(
      `Processing SES event: ${sesEvent.eventType} for message ${sesEvent.mail.messageId}`,
    );

    // Find the org_email record by messageId
    const orgEmail = await this.db.query.orgEmailsTable.findFirst({
      where: eq(orgEmailsTable.messageId, sesEvent.mail.messageId),
    });

    if (!orgEmail) {
      this.logger.warn(
        `No org_email found for messageId: ${sesEvent.mail.messageId}`,
      );
      // Still queue the event for processing - it may be a delayed event
    }

    // Queue the event for background processing
    await this.webhookQueue.addSesEventJob({
      eventType: sesEvent.eventType,
      sesEvent: sesEvent as unknown as Record<string, unknown>,
      orgEmailId: orgEmail?.id ?? null,
      messageId: sesEvent.mail.messageId,
      timestamp: sesEvent.mail.timestamp,
    });

    return { status: 'Event queued for processing' };
  }

  private async handleSubscriptionConfirmation(
    message: SnsSubscriptionConfirmationMessage,
  ) {
    this.logger.log('Received SNS SubscriptionConfirmation');

    // Auto-confirm the subscription by visiting the SubscribeURL
    // This should be done in a background job to avoid webhook timeout
    await this.webhookQueue.confirmSubscription(message.SubscribeURL);

    return { status: 'Subscription confirmation received' };
  }

  private handleUnsubscribeConfirmation(
    _message: SnsUnsubscribeConfirmationMessage,
  ) {
    this.logger.warn('Received SNS UnsubscribeConfirmation');
    return { status: 'Unsubscribe confirmation received' };
  }
}
