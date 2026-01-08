import { Module } from '@nestjs/common';

import { CustomFieldsModule } from '../custom-fields/custom-fields.module';
import { RecordLayoutsController } from './record-layouts.controller';
import { RecordLayoutsService } from './record-layouts.service';

@Module({
  imports: [CustomFieldsModule],
  controllers: [RecordLayoutsController],
  providers: [RecordLayoutsService],
  exports: [RecordLayoutsService],
})
export class RecordLayoutsModule {}
