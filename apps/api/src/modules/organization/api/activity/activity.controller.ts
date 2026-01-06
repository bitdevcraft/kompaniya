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
import { type NewOrgActivity, type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { ActivityService } from './activity.service';
import { type CreateActivityDto } from './dto/create-activity.dto';
import { type DeleteActivitiesDto } from './dto/delete-activities.dto';
import { type UpdateActivityDto } from './dto/update-activity.dto';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    const record: NewOrgActivity = {
      ...createActivityDto,
      organizationId: organization.id,
    };

    await this.activityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.activityService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.activityService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Activity doesn't exist");
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
    return await this.activityService.getDataTable(
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
    const record = await this.activityService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Activity doesn't exist");
    }

    await this.activityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.activityService.deleteRecordById(id, organization.id);
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteActivitiesDto: DeleteActivitiesDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteActivitiesDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.activityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.activityService.deleteRecordsByIds(
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
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    const record = await this.activityService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Activity doesn't exist");
    }

    await this.activityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.activityService.deleteCacheById(record.id, organization.id);

    return await this.activityService.updateRecordById(
      id,
      organization.id,
      updateActivityDto,
    );
  }
}
