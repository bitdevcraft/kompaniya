import type { Db } from '@repo/database';
import type {
  CsvImportJob,
  CsvImportJobRowResult,
  NewCsvImportJob,
  NewCsvImportJobRowResult,
} from '@repo/database/schema';

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  csvImportJobRowResultsTable,
  csvImportJobsTable,
} from '@repo/database/schema';
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

export type CsvImportJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'partial_success';

type CreateJobParams = {
  organizationId: string;
  tableId: string;
  fileId: string;
  fileName?: string;
  totalRows?: number;
  userId?: string;
  bullJobId?: string;
};

type CreateRowResultParams = {
  jobId: string;
  rowNumber: number;
  status: 'success' | 'failed';
  rowData?: string;
  errorMessage?: string;
  errorField?: string;
  recordId?: string;
};

type ListJobsOptions = {
  organizationId: string;
  status?: string;
  limit?: number;
  offset?: number;
};

type UpdateJobParams = {
  status?: CsvImportJobStatus;
  processedRows?: number;
  successfulRows?: number;
  failedRows?: number;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  errorDetails?: string;
  bullJobId?: string;
};

@Injectable()
export class CsvImportJobsService {
  private readonly logger = new Logger(CsvImportJobsService.name);

  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  async createJob(params: CreateJobParams): Promise<CsvImportJob> {
    const newJob: NewCsvImportJob = {
      organizationId: params.organizationId,
      tableId: params.tableId,
      fileId: params.fileId,
      fileName: params.fileName,
      totalRows: params.totalRows,
      bullJobId: params.bullJobId,
      createdBy: params.userId,
      status: 'queued',
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0,
    };

    const result = await this.db
      .insert(csvImportJobsTable)
      .values(newJob)
      .returning();

    const job = result[0];
    if (!job) {
      throw new BadRequestException('Failed to create CSV import job');
    }

    this.logger.log(`Created CSV import job ${job.id}`);
    return job;
  }

  async createRowResult(
    params: CreateRowResultParams,
  ): Promise<CsvImportJobRowResult> {
    const newResult: NewCsvImportJobRowResult = {
      job: params.jobId,
      rowNumber: params.rowNumber,
      status: params.status,
      rowData: params.rowData,
      errorMessage: params.errorMessage,
      errorField: params.errorField,
      recordId: params.recordId,
    };

    const result = await this.db
      .insert(csvImportJobRowResultsTable)
      .values(newResult)
      .returning();

    const rowResult = result[0];
    if (!rowResult) {
      throw new BadRequestException('Failed to create row result');
    }

    return rowResult;
  }

  async deleteJob(jobId: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .delete(csvImportJobsTable)
      .where(
        and(
          eq(csvImportJobsTable.id, jobId),
          eq(csvImportJobsTable.organizationId, organizationId),
        ),
      )
      .returning();

    return result.length > 0;
  }

  async getFailedRows(
    jobId: string,
    organizationId: string,
    limit = 100,
    offset = 0,
  ): Promise<{ rows: CsvImportJobRowResult[]; total: number }> {
    return this.getRowResults(jobId, organizationId, {
      limit,
      offset,
      status: 'failed',
    });
  }

  async getJobById(
    jobId: string,
    organizationId: string,
  ): Promise<CsvImportJob | null> {
    const result = await this.db.query.csvImportJobsTable.findFirst({
      where: and(
        eq(csvImportJobsTable.id, jobId),
        eq(csvImportJobsTable.organizationId, organizationId),
      ),
    });

    return result ?? null;
  }

  async getJobsByStatus(
    statuses: CsvImportJobStatus[],
  ): Promise<CsvImportJob[]> {
    const jobs = await this.db.query.csvImportJobsTable.findMany({
      where: eq(
        csvImportJobsTable.status,
        sql`${csvImportJobsTable.status} = ANY(${statuses})`,
      ),
      orderBy: [asc(csvImportJobsTable.createdAt)],
      limit: 100,
    });

    return jobs;
  }

  async getJobWithRowResults(
    jobId: string,
    organizationId: string,
    options?: { limit?: number },
  ): Promise<(CsvImportJob & { rowResults: CsvImportJobRowResult[] }) | null> {
    const limit = options?.limit ?? 100;

    const job = await this.db.query.csvImportJobsTable.findFirst({
      where: and(
        eq(csvImportJobsTable.id, jobId),
        eq(csvImportJobsTable.organizationId, organizationId),
      ),
      with: {
        rowResults: {
          orderBy: [asc(csvImportJobRowResultsTable.rowNumber)],
          limit,
        },
      },
    });

    if (!job) {
      return null;
    }

    return job as CsvImportJob & { rowResults: CsvImportJobRowResult[] };
  }

  async getRowResults(
    jobId: string,
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: 'success' | 'failed';
    },
  ): Promise<{ rows: CsvImportJobRowResult[]; total: number }> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    // First verify job belongs to organization
    const job = await this.getJobById(jobId, organizationId);
    if (!job) {
      return { rows: [], total: 0 };
    }

    const whereConditions = [eq(csvImportJobRowResultsTable.job, jobId)];

    if (options?.status) {
      whereConditions.push(
        eq(csvImportJobRowResultsTable.status, options.status),
      );
    }

    const rows = await this.db.query.csvImportJobRowResultsTable.findMany({
      where: and(...whereConditions),
      orderBy: [asc(csvImportJobRowResultsTable.rowNumber)],
      limit,
      offset,
    });

    const totalResult = await this.db
      .select({ count: count() })
      .from(csvImportJobRowResultsTable)
      .where(and(...whereConditions));

    return {
      rows,
      total: totalResult[0]?.count ?? 0,
    };
  }

  async listJobs(
    options: ListJobsOptions,
  ): Promise<{ jobs: CsvImportJob[]; total: number }> {
    const { organizationId, status, limit = 50, offset = 0 } = options;

    const whereConditions = [
      eq(csvImportJobsTable.organizationId, organizationId),
    ];

    if (status) {
      whereConditions.push(
        eq(csvImportJobsTable.status, status as CsvImportJobStatus),
      );
    }

    const jobs = await this.db.query.csvImportJobsTable.findMany({
      where: and(...whereConditions),
      orderBy: [desc(csvImportJobsTable.createdAt)],
      limit,
      offset,
    });

    const totalResult = await this.db
      .select({ count: count() })
      .from(csvImportJobsTable)
      .where(and(...whereConditions));

    return {
      jobs,
      total: totalResult[0]?.count ?? 0,
    };
  }

  async updateJob(
    jobId: string,
    params: UpdateJobParams,
  ): Promise<CsvImportJob | null> {
    const result = await this.db
      .update(csvImportJobsTable)
      .set(params)
      .where(eq(csvImportJobsTable.id, jobId))
      .returning();

    if (result.length > 0) {
      this.logger.debug(
        `Updated CSV import job ${jobId}: status=${params.status}, processed=${params.processedRows}, successful=${params.successfulRows}, failed=${params.failedRows}`,
      );
    }

    return result[0] ?? null;
  }
}
