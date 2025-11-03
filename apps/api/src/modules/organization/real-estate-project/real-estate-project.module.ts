import { Module } from '@nestjs/common';

import { RealEstateProjectController } from './real-estate-project.controller';
import { RealEstateProjectService } from './real-estate-project.service';

@Module({
  controllers: [RealEstateProjectController],
  providers: [RealEstateProjectService],
})
export class RealEstateProjectModule {}
