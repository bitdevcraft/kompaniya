import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { RealEstatePropertyService } from './real-estate-property.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-property')
export class RealEstatePropertyController {
  constructor(
    private readonly realEstatePropertyService: RealEstatePropertyService,
  ) {}

  @Get('paginated')
  async paginatedData(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.realEstatePropertyService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }
}
