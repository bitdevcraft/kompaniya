import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { LeadService } from './lead.service';
@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Delete('r/:id')
  async deleteRecord(
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

  @Get('paginated')
  async paginatedData(
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
}
