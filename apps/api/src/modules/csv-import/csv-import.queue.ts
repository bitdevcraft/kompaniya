import type { JobsOptions, Queue } from 'bullmq';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

import type { ColumnMapping } from './csv-import.types';

export const CSV_IMPORT_QUEUE_NAME = 'csv-import';

export type CsvImportJobData = {
  fileId: string;
  tableId: string;
  organizationId: string;
  mapping: ColumnMapping;
};

type CsvImportQueueJob = {
  name: string;
  data: CsvImportJobData;
  options?: JobsOptions;
};

@Injectable()
export class CsvImportQueueService {
  constructor(
    @InjectQueue(CSV_IMPORT_QUEUE_NAME)
    private readonly queue: Queue<CsvImportJobData>,
  ) {}

  async enqueue(job: CsvImportQueueJob): Promise<void> {
    const options: JobsOptions = { ...job.options };
    if (!options.jobId) {
      options.jobId = job.name;
    }
    await this.queue.add(job.name, job.data, options);
  }
}
