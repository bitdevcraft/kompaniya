import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { EmailTemplateService } from './email-template.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/email-template')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  async add(
    @Body() createTemplate: CreateTemplateDto,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.emailTemplateService.createTemplate({
      name: createTemplate.name,
      subject: createTemplate.subject,
      body: createTemplate.body,
      organizationId: organization.id,
    });
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
}
