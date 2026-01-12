import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { CustomFieldsModule } from '../core/custom-fields/custom-fields.module';
import { FileUploadModule } from '../core/file-upload/file-upload.module';
import { CsvImportController } from './csv-import.controller';
import { CsvImportProcessor } from './csv-import.processor';
import {
  CSV_IMPORT_QUEUE_NAME,
  CsvImportQueueService,
} from './csv-import.queue';
import { CsvImportService } from './csv-import.service';

@Module({
  imports: [
    CustomFieldsModule,
    FileUploadModule,
    BullModule.registerQueue({ name: CSV_IMPORT_QUEUE_NAME }),
  ],
  controllers: [CsvImportController],
  providers: [CsvImportService, CsvImportQueueService, CsvImportProcessor],
})
export class CsvImportModule {}
