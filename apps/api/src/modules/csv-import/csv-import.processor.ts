import type { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

import {
  CSV_IMPORT_QUEUE_NAME,
  type CsvImportJobData,
} from './csv-import.queue';
import { CsvImportService } from './csv-import.service';

@Injectable()
@Processor(CSV_IMPORT_QUEUE_NAME)
export class CsvImportProcessor extends WorkerHost {
  private readonly logger = new Logger(CsvImportProcessor.name);

  constructor(private readonly csvImportService: CsvImportService) {
    super();
  }

  async process(job: Job<CsvImportJobData>): Promise<void> {
    const { csvImportJobId, ...jobData } = job.data;
    this.logger.log(
      `Processing CSV import job ${job.name} (${job.id})${csvImportJobId ? `, tracking ID: ${csvImportJobId}` : ''}`,
    );
    await this.csvImportService.processImportJob(jobData, csvImportJobId);
  }
}
