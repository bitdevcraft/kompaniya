import { Module } from '@nestjs/common';

import { FileUploadModule } from '../file-upload/file-upload.module';
import { CsvImportController } from './csv-import.controller';
import { CsvImportQueueService } from './csv-import.queue';
import { CsvImportService } from './csv-import.service';

@Module({
  imports: [FileUploadModule],
  controllers: [CsvImportController],
  providers: [CsvImportService, CsvImportQueueService],
})
export class CsvImportModule {}
