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
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { EmailTemplateService } from './email-template.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/email-template')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  async add(
    @Body() createTemplate: CreateTemplateDto,
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
  ) {
    const template: NewOrgEmailTemplate = {
      name: createTemplate.name,
      subject: createTemplate.subject,
      body: createTemplate.body,
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

    return await this.emailTemplateService.updateRecordById(
      id,
      organization.id,
      updateTemplateDto,
    );
  }
}
