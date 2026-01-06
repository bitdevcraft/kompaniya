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
  type NewOrgEmailCampaign,
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
import { type CreateEmailCampaignDto } from './dto/create-email-campaign.dto';
import { type UpdateEmailCampaignDto } from './dto/update-email-campaign.dto';
import { EmailCampaignService } from './email-campaign.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/email-campaign')
export class EmailCampaignController {
  constructor(private readonly emailCampaignService: EmailCampaignService) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createEmailCampaignDto: CreateEmailCampaignDto,
  ) {
    const body =
      createEmailCampaignDto.body ?? createEmailCampaignDto.htmlContent;
    const htmlContent =
      createEmailCampaignDto.htmlContent ?? createEmailCampaignDto.body;
    const record: NewOrgEmailCampaign = {
      ...createEmailCampaignDto,
      body,
      htmlContent,
      organizationId: organization.id,
    };

    await this.emailCampaignService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.emailCampaignService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.emailCampaignService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email campaign doesn't exist");
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
    return await this.emailCampaignService.getDataTable(
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
    const record = await this.emailCampaignService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email campaign doesn't exist");
    }

    await this.emailCampaignService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.emailCampaignService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Patch('r/:id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
    @Body() updateEmailCampaignDto: UpdateEmailCampaignDto,
  ) {
    const record = await this.emailCampaignService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email campaign doesn't exist");
    }

    await this.emailCampaignService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.emailCampaignService.deleteCacheById(record.id, organization.id);

    const updatePayload: UpdateEmailCampaignDto = { ...updateEmailCampaignDto };

    if (updatePayload.body && !updatePayload.htmlContent) {
      updatePayload.htmlContent = updatePayload.body;
    }

    if (updatePayload.htmlContent && !updatePayload.body) {
      updatePayload.body = updatePayload.htmlContent;
    }

    return await this.emailCampaignService.updateRecordById(
      id,
      organization.id,
      updatePayload,
    );
  }
}
