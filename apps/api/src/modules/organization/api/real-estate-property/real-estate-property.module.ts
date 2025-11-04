import { Module } from '@nestjs/common';

import { RealEstatePropertyController } from './real-estate-property.controller';
import { RealEstatePropertyService } from './real-estate-property.service';

@Module({
  controllers: [RealEstatePropertyController],
  providers: [RealEstatePropertyService],
})
export class RealEstatePropertyModule {}
