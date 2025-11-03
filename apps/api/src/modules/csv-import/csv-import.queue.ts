import { Injectable, Logger } from '@nestjs/common';

type CsvImportJob = {
  name: string;
  handler: () => Promise<void>;
};

@Injectable()
export class CsvImportQueueService {
  private readonly logger = new Logger(CsvImportQueueService.name);
  private processing = false;
  private readonly queue: CsvImportJob[] = [];

  enqueue(job: CsvImportJob) {
    this.queue.push(job);
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    const job = this.queue.shift();
    if (!job) {
      return;
    }

    this.processing = true;
    this.logger.log(`Starting CSV import job: ${job.name}`);

    try {
      await job.handler();
      this.logger.log(`Completed CSV import job: ${job.name}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `CSV import job failed: ${job.name}`,
          error.stack,
          error.message,
        );
      } else {
        this.logger.error(
          `CSV import job failed: ${job.name} - ${JSON.stringify(error)}`,
        );
      }
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        void this.processQueue();
      }
    }
  }
}
