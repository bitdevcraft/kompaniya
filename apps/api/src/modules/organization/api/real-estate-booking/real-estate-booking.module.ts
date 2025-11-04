import { Module } from '@nestjs/common';

import { RealEstateBookingController } from './real-estate-booking.controller';
import { RealEstateBookingService } from './real-estate-booking.service';

@Module({
  controllers: [RealEstateBookingController],
  providers: [RealEstateBookingService],
})
export class RealEstateBookingModule {}
