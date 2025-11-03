import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { OrganizationRepositoryService } from '~/modules/core/database/repository/organization-repository/organization-repository.service';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { OpportunityService } from './opportunity.service';

@Controller('api/organization/opportunity')
export class OpportunityController {
  constructor(
    private readonly opportunityService: OpportunityService,
    private readonly organizationRepositoryService: OrganizationRepositoryService,
  ) {}

  @Get('paginated')
  async paginatedData(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
  ) {
    const organization =
      await this.organizationRepositoryService.getActiveOrganization(
        session.user.id,
      );

    if (!organization) {
      throw new BadRequestException('Admin Session has no Organization');
    }

    return await this.opportunityService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }
}
