import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { SesEventHandlerService } from './ses-event-handler.service';
import { SES_WEBHOOK_QUEUE_NAME } from './ses-webhook-queue.service';
import { SesWebhookQueueService } from './ses-webhook-queue.service';
import { SesWebhookProcessor } from './ses-webhook.processor';
import { SnsSignatureVerifierService } from './sns-signature-verifier.service';
import { SnsWebhookController } from './sns-webhook.controller';
import { SnsWebhookService } from './sns-webhook.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: SES_WEBHOOK_QUEUE_NAME }),
    HttpModule,
  ],
  controllers: [SnsWebhookController],
  providers: [
    SnsWebhookService,
    SnsSignatureVerifierService,
    SesWebhookQueueService,
    SesWebhookProcessor,
    SesEventHandlerService,
  ],
  exports: [SnsWebhookService],
})
export class SnsWebhookModule {}
