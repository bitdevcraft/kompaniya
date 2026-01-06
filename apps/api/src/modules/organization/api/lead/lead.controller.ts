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
import { NewOrgLead, type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { type DeleteLeadsDto } from './dto/delete-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadService } from './lead.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/lead')
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createLead: CreateLeadDto,
  ) {
    const record: NewOrgLead = {
      ...createLead,
      organizationId: organization.id,
    };

    await this.leadService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.leadService.createNewRecord(record);
  }

  @Get('paginated')
  async findAllPaginated(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.leadService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.leadService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Contact doesn't exist");
    }

    return record;
  }

  @Delete('r/:id')
  async remove(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.leadService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Contact doesn't exist");
    }

    await this.leadService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.leadService.deleteRecordById(id, organization.id);
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteLeadsDto: DeleteLeadsDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteLeadsDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.leadService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.leadService.deleteRecordsByIds(ids, organization.id);
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
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    const record = await this.leadService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Contact doesn't exist");
    }

    await this.leadService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.leadService.deleteCacheById(record.id, organization.id);

    return await this.leadService.updateRecordById(id, updateLeadDto);
  }
}
