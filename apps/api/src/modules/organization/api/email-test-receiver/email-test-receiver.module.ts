import { Module } from '@nestjs/common';

import { EmailTestReceiverController } from './email-test-receiver.controller';
import { EmailTestReceiverService } from './email-test-receiver.service';

@Module({
  controllers: [EmailTestReceiverController],
  providers: [EmailTestReceiverService],
})
export class EmailTestReceiverModule {}
