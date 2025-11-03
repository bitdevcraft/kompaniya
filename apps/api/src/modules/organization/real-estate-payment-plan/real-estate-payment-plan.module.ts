import { Module } from '@nestjs/common';

import { RealEstatePaymentPlanController } from './real-estate-payment-plan.controller';
import { RealEstatePaymentPlanService } from './real-estate-payment-plan.service';

@Module({
  controllers: [RealEstatePaymentPlanController],
  providers: [RealEstatePaymentPlanService],
})
export class RealEstatePaymentPlanModule {}
