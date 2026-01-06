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
  type NewOrgEmailTestReceiver,
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
import { type CreateEmailTestReceiverDto } from './dto/create-email-test-receiver.dto';
import { type DeleteEmailTestReceiversDto } from './dto/delete-email-test-receivers.dto';
import { type UpdateEmailTestReceiverDto } from './dto/update-email-test-receiver.dto';
import { EmailTestReceiverService } from './email-test-receiver.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/email-test-receiver')
export class EmailTestReceiverController {
  constructor(
    private readonly emailTestReceiverService: EmailTestReceiverService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createEmailTestReceiverDto: CreateEmailTestReceiverDto,
  ) {
    const record: NewOrgEmailTestReceiver = {
      ...createEmailTestReceiverDto,
      organizationId: organization.id,
    };

    await this.emailTestReceiverService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.emailTestReceiverService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.emailTestReceiverService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email test receiver doesn't exist");
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
    return await this.emailTestReceiverService.getDataTable(
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
    const record = await this.emailTestReceiverService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email test receiver doesn't exist");
    }

    await this.emailTestReceiverService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.emailTestReceiverService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteEmailTestReceiversDto: DeleteEmailTestReceiversDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteEmailTestReceiversDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.emailTestReceiverService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.emailTestReceiverService.deleteRecordsByIds(
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
    @Body() updateEmailTestReceiverDto: UpdateEmailTestReceiverDto,
  ) {
    const record = await this.emailTestReceiverService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Email test receiver doesn't exist");
    }

    await this.emailTestReceiverService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.emailTestReceiverService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.emailTestReceiverService.updateRecordById(
      id,
      organization.id,
      updateEmailTestReceiverDto,
    );
  }
}
