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
import { RealEstatePaymentPlanService } from './real-estate-payment-plan.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-payment-plan')
export class RealEstatePaymentPlanController {
  constructor(
    private readonly realEstatePaymentPlanService: RealEstatePaymentPlanService,
  ) {}

  @Get('paginated')
  async paginatedData(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.realEstatePaymentPlanService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }
}
