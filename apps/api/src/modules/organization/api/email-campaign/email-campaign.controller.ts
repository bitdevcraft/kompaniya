import {
  BadRequestException,
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
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { type CreateEmailCampaignDto } from './dto/create-email-campaign.dto';
import { type DeleteEmailCampaignsDto } from './dto/delete-email-campaigns.dto';
import { PreviewRecipientsDto } from './dto/preview-recipients.dto';
import { ScheduleCampaignDto } from './dto/schedule-campaign.dto';
import { SendTestDto } from './dto/send-test.dto';
import { type UpdateEmailCampaignDto } from './dto/update-email-campaign.dto';
import { EmailCampaignSendService } from './email-campaign-send.service';
import { EmailCampaignService } from './email-campaign.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/email-campaign')
export class EmailCampaignController {
  constructor(
    private readonly emailCampaignService: EmailCampaignService,
    private readonly emailCampaignSendService: EmailCampaignSendService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post('r/:id/cancel')
  async cancel(
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

    await this.emailCampaignSendService.cancelCampaign(id, organization.id);

    // Invalidate cache
    await this.emailCampaignService.deleteCacheById(id, organization.id);

    return { success: true, message: 'Campaign cancelled' };
  }

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

  @Post('r/:id/pause')
  async pause(
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

    await this.emailCampaignSendService.pauseCampaign(id, organization.id);

    // Invalidate cache
    await this.emailCampaignService.deleteCacheById(id, organization.id);

    return { success: true, message: 'Campaign paused' };
  }

  @Get('preview-recipients')
  async previewRecipients(
    @ActiveOrganization() organization: Organization,
    @Query() query: PreviewRecipientsDto,
  ) {
    const contacts = await this.emailCampaignSendService.getMatchedContacts(
      organization.id,
      query,
    );

    return {
      count: contacts.length,
      sample: contacts.slice(0, 10),
    };
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

  @Delete('bulk')
  async removeBulk(
    @Body() deleteEmailCampaignsDto: DeleteEmailCampaignsDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteEmailCampaignsDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.emailCampaignService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.emailCampaignService.deleteRecordsByIds(
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

  @Post('r/:id/resume')
  async resume(
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

    await this.emailCampaignSendService.resumeCampaign(id, organization.id);

    // Invalidate cache
    await this.emailCampaignService.deleteCacheById(id, organization.id);

    return { success: true, message: 'Campaign resumed' };
  }

  @Post('r/:id/schedule')
  async schedule(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
    @Body() scheduleCampaignDto: ScheduleCampaignDto,
  ) {
    const record = await this.emailCampaignService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email campaign doesn't exist");
    }

    const scheduledFor = new Date(scheduleCampaignDto.scheduledFor);

    await this.emailCampaignSendService.scheduleCampaign(
      id,
      organization.id,
      scheduledFor,
    );

    // Invalidate cache
    await this.emailCampaignService.deleteCacheById(id, organization.id);

    return {
      success: true,
      message: `Campaign scheduled for ${scheduledFor.toISOString()}`,
    };
  }

  @Post('r/:id/send')
  async send(
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

    if (record.status !== 'DRAFT') {
      throw new BadRequestException(
        `Cannot send campaign with status: ${record.status}`,
      );
    }

    await this.emailCampaignSendService.startCampaign(id, organization.id);

    // Invalidate cache
    await this.emailCampaignService.deleteCacheById(id, organization.id);

    return { success: true, message: 'Campaign sending started' };
  }

  @Post('r/:id/test')
  async sendTest(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
    @Body() sendTestDto: SendTestDto,
  ) {
    const record = await this.emailCampaignService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email campaign doesn't exist");
    }

    // If testReceiverIds are provided, fetch the test receiver emails
    const testEmails = sendTestDto.emailAddresses ?? [];

    if (sendTestDto.testReceiverIds && sendTestDto.testReceiverIds.length > 0) {
      // Fetch test receivers and add their emails
      // This would require injecting the test receiver service
      // For now, we'll just use the provided email addresses
    }

    if (testEmails.length === 0) {
      throw new BadRequestException('No test email addresses provided');
    }

    await this.emailCampaignSendService.sendTestEmails(
      id,
      organization.id,
      testEmails,
      sendTestDto.testReceiverIds?.[0],
    );

    return { success: true, message: `Sent ${testEmails.length} test emails` };
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
