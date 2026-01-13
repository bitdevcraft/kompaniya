import type { Response } from 'express';

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { OrganizationRepositoryService } from '../core/database/repository/organization-repository/organization-repository.service';
import { FileUploadService } from '../core/file-upload/file-upload.service';
import { CsvImportJobsService } from './csv-import-jobs.service';
import { CsvImportService } from './csv-import.service';

const previewSchema = z.object({
  fileId: z.string().min(1),
});

type PreviewDto = z.infer<typeof previewSchema>;

const submitSchema = z.object({
  tableId: z.string().min(1),
  fileId: z.string().min(1),
  mapping: z.record(z.string(), z.union([z.string().min(1), z.literal(null)])),
});

type SubmitDto = z.infer<typeof submitSchema>;

@Controller('api/csv-import')
export class CsvImportController {
  constructor(
    private readonly csvImportService: CsvImportService,
    private readonly csvImportJobsService: CsvImportJobsService,
    private readonly organizationRepository: OrganizationRepositoryService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('jobs/:id/failed-rows')
  async getFailedRows(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException('Active organization not found.');
    }

    return this.csvImportJobsService.getFailedRows(
      id,
      organization.id,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  }

  @Get('jobs/:id')
  async getJob(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Query('includeResults') includeResults?: string,
  ) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException('Active organization not found.');
    }

    if (includeResults === 'true') {
      return this.csvImportJobsService.getJobWithRowResults(
        id,
        organization.id,
      );
    }

    return this.csvImportJobsService.getJobById(id, organization.id);
  }

  @Get('options')
  async getOptions(@Session() session: UserSession) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException(
        'Active organization could not be resolved.',
      );
    }

    const tables = await this.csvImportService.getTableOptions(organization.id);
    return { tables };
  }

  @Get('jobs/:id/events')
  async jobEvents(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Res() res: Response,
  ) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException('Active organization not found.');
    }

    const job = await this.csvImportJobsService.getJobById(id, organization.id);
    if (!job) {
      throw new BadRequestException('Import job not found.');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify(job)}\n\n`);

    if (['completed', 'failed', 'partial_success'].includes(job.status)) {
      res.end();
      return;
    }

    const interval = setInterval(() => {
      this.csvImportJobsService
        .getJobById(id, organization.id)
        .then((updatedJob) => {
          if (updatedJob) {
            res.write(`data: ${JSON.stringify(updatedJob)}\n\n`);

            if (
              ['completed', 'failed', 'partial_success'].includes(
                updatedJob.status,
              )
            ) {
              clearInterval(interval);
              res.end();
            }
          }
        })
        .catch(() => {
          // Ignore errors during polling
        });
    }, 1000);

    res.on('close', () => {
      clearInterval(interval);
    });
  }

  @Get('jobs')
  async listJobs(
    @Session() session: UserSession,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException('Active organization not found.');
    }

    return this.csvImportJobsService.listJobs({
      organizationId: organization.id,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('preview')
  async preview(
    @Body(new ZodValidationPipe(previewSchema)) body: PreviewDto,
    @Session() session: UserSession,
  ) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException(
        'Active organization could not be resolved.',
      );
    }

    return this.csvImportService.getPreview(body.fileId);
  }

  @Post('submit')
  async submit(
    @Body(new ZodValidationPipe(submitSchema)) body: SubmitDto,
    @Session() session: UserSession,
  ) {
    const organization =
      await this.organizationRepository.getActiveOrganization(session.user.id);

    if (!organization) {
      throw new BadRequestException(
        'Active organization could not be resolved for import.',
      );
    }

    const metadata = await this.safeGetMetadata(body.fileId);

    const csvImportJob = await this.csvImportJobsService.createJob({
      organizationId: organization.id,
      tableId: body.tableId,
      fileId: body.fileId,
      fileName: metadata?.name,
      userId: session.user.id,
    });

    const { bullJobId } = await this.csvImportService.enqueueImport(
      body.tableId,
      body.fileId,
      organization.id,
      body.mapping,
      csvImportJob.id,
    );

    await this.csvImportJobsService.updateJob(csvImportJob.id, {
      bullJobId,
    });

    return {
      status: 'queued',
      jobId: csvImportJob.id,
    };
  }

  private async safeGetMetadata(fileId: string) {
    try {
      const metadata = await this.fileUploadService.getUploadMetadata(fileId);
      return metadata;
    } catch (_error) {
      return null;
    }
  }
}
