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
  type NewOrgRealEstatePaymentPlan,
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
import { type CreateRealEstatePaymentPlanDto } from './dto/create-real-estate-payment-plan.dto';
import { type UpdateRealEstatePaymentPlanDto } from './dto/update-real-estate-payment-plan.dto';
import { RealEstatePaymentPlanService } from './real-estate-payment-plan.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-payment-plan')
export class RealEstatePaymentPlanController {
  constructor(
    private readonly realEstatePaymentPlanService: RealEstatePaymentPlanService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createRealEstatePaymentPlanDto: CreateRealEstatePaymentPlanDto,
  ) {
    const record: NewOrgRealEstatePaymentPlan = {
      ...createRealEstatePaymentPlanDto,
      organizationId: organization.id,
    };

    await this.realEstatePaymentPlanService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstatePaymentPlanService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.realEstatePaymentPlanService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate payment plan doesn't exist");
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
    return await this.realEstatePaymentPlanService.getDataTable(
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
    const record = await this.realEstatePaymentPlanService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate payment plan doesn't exist");
    }

    await this.realEstatePaymentPlanService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstatePaymentPlanService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Patch('r/:id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
    @Body() updateRealEstatePaymentPlanDto: UpdateRealEstatePaymentPlanDto,
  ) {
    const record = await this.realEstatePaymentPlanService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate payment plan doesn't exist");
    }

    await this.realEstatePaymentPlanService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.realEstatePaymentPlanService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.realEstatePaymentPlanService.updateRecordById(
      id,
      organization.id,
      updateRealEstatePaymentPlanDto,
    );
  }
}
