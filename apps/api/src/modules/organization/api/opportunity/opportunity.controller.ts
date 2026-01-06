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
  type NewOrgOpportunity,
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
import { type CreateOpportunityDto } from './dto/create-opportunity.dto';
import { type DeleteOpportunitiesDto } from './dto/delete-opportunities.dto';
import { type UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityService } from './opportunity.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/opportunity')
export class OpportunityController {
  constructor(
    private readonly opportunityService: OpportunityService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createOpportunityDto: CreateOpportunityDto,
  ) {
    const record: NewOrgOpportunity = {
      ...createOpportunityDto,
      organizationId: organization.id,
    };

    await this.opportunityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.opportunityService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.opportunityService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Opportunity doesn't exist");
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
    return await this.opportunityService.getDataTable(
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
    const record = await this.opportunityService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Opportunity doesn't exist");
    }

    await this.opportunityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.opportunityService.deleteRecordById(id, organization.id);
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteOpportunitiesDto: DeleteOpportunitiesDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteOpportunitiesDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.opportunityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.opportunityService.deleteRecordsByIds(
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
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    const record = await this.opportunityService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Opportunity doesn't exist");
    }

    await this.opportunityService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.opportunityService.deleteCacheById(record.id, organization.id);

    return await this.opportunityService.updateRecordById(
      id,
      organization.id,
      updateOpportunityDto,
    );
  }
}
