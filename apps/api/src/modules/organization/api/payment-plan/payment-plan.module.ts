import { Module } from '@nestjs/common';

import { PaymentPlanController } from './payment-plan.controller';
import { PaymentPlanService } from './payment-plan.service';

@Module({
  controllers: [PaymentPlanController],
  providers: [PaymentPlanService],
})
export class PaymentPlanModule {}
