import { Module } from '@nestjs/common';

import { PaymentPlanTemplateController } from './payment-plan-template.controller';
import { PaymentPlanTemplateService } from './payment-plan-template.service';

@Module({
  controllers: [PaymentPlanTemplateController],
  providers: [PaymentPlanTemplateService],
})
export class PaymentPlanTemplateModule {}
