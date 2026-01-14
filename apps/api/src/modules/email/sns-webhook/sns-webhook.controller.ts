import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { snsMessageSchema, type SnsMessageType } from './dto/sns-message.dto';
import { SnsWebhookService } from './sns-webhook.service';

@Controller('api/webhooks/ses')
export class SnsWebhookController {
  constructor(private readonly snsWebhookService: SnsWebhookService) {}

  @Post()
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body(new ZodValidationPipe(snsMessageSchema)) body: SnsMessageType,
  ) {
    const rawBody = req.rawBody?.toString() || '';

    return await this.snsWebhookService.processSnsMessage(body, rawBody);
  }
}
