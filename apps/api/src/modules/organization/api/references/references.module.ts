import { Module } from '@nestjs/common';

import { ReferenceDiscoveryService } from './reference-discovery.service';
import { ReferencesController } from './references.controller';
import { RelatedRecordsService } from './related-records.service';

@Module({
  controllers: [ReferencesController],
  providers: [ReferenceDiscoveryService, RelatedRecordsService],
})
export class ReferencesModule {}
