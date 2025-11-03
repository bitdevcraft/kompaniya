import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { OrganizationRepositoryService } from '../core/database/repository/organization-repository/organization-repository.service';
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
    private readonly organizationRepository: OrganizationRepositoryService,
  ) {}

  @Get('options')
  getOptions() {
    return { tables: this.csvImportService.getTableOptions() };
  }

  @Post('preview')
  preview(@Body(new ZodValidationPipe(previewSchema)) body: PreviewDto) {
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

    return this.csvImportService.enqueueImport(
      body.tableId,
      body.fileId,
      organization.id,
      body.mapping,
    );
  }
}
