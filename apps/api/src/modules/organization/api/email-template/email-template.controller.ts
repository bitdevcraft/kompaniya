import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  type NewOrgEmailTemplate,
  type Organization,
} from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { type DeleteEmailTemplatesDto } from './dto/delete-email-templates.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { EmailTemplateService } from './email-template.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/email-template')
export class EmailTemplateController {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async add(
    @Body() createTemplate: CreateTemplateDto,
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
  ) {
    const body = createTemplate.body ?? createTemplate.htmlContent;
    const htmlContent = createTemplate.htmlContent ?? createTemplate.body;
    const template: NewOrgEmailTemplate = {
      name: createTemplate.name,
      subject: createTemplate.subject,
      body,
      htmlContent,
      mjmlContent: createTemplate.mjmlContent,
      mjmlJsonContent: createTemplate.mjmlJsonContent,
      organizationId: organization.id,
    };

    await this.emailTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.emailTemplateService.createTemplate(template);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.emailTemplateService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email template doesn't exist");
    }

    return record;
  }

  @Get('paginated')
  async paginatedData(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.emailTemplateService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }

  @Delete('r/:id')
  async remove(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.emailTemplateService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email template doesn't exist");
    }

    await this.emailTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.emailTemplateService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteEmailTemplatesDto: DeleteEmailTemplatesDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteEmailTemplatesDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.emailTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.emailTemplateService.deleteRecordsByIds(
        ids,
        organization.id,
      );
    } catch (error) {
      if (this.drizzleErrorService.isDatabaseError(error)) {
        this.drizzleErrorService.handleDrizzleError(error);
      }
      throw error;
    }
  }

  @Patch('r/:id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const record = await this.emailTemplateService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email template doesn't exist");
    }

    await this.emailTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.emailTemplateService.deleteCacheById(record.id, organization.id);

    const updatePayload: UpdateTemplateDto = { ...updateTemplateDto };

    if (updatePayload.body && !updatePayload.htmlContent) {
      updatePayload.htmlContent = updatePayload.body;
    }

    if (updatePayload.htmlContent && !updatePayload.body) {
      updatePayload.body = updatePayload.htmlContent;
    }

    return await this.emailTemplateService.updateRecordById(
      id,
      organization.id,
      updatePayload,
    );
  }
}
