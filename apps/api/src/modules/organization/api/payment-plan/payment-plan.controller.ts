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
  type NewOrgPaymentPlan,
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
import { type CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { type UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';
import { PaymentPlanService } from './payment-plan.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/payment-plan')
export class PaymentPlanController {
  constructor(private readonly paymentPlanService: PaymentPlanService) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createPaymentPlanDto: CreatePaymentPlanDto,
  ) {
    const record: NewOrgPaymentPlan = {
      ...createPaymentPlanDto,
      organizationId: organization.id,
    };

    await this.paymentPlanService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.paymentPlanService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.paymentPlanService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Payment plan doesn't exist");
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
    return await this.paymentPlanService.getDataTable(
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
    const record = await this.paymentPlanService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Payment plan doesn't exist");
    }

    await this.paymentPlanService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.paymentPlanService.deleteCacheById(record.id, organization.id);

    return await this.paymentPlanService.deleteRecordById(id, organization.id);
  }

  @Patch('r/:id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
    @Body() updatePaymentPlanDto: UpdatePaymentPlanDto,
  ) {
    const record = await this.paymentPlanService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Payment plan doesn't exist");
    }

    await this.paymentPlanService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.paymentPlanService.deleteCacheById(record.id, organization.id);

    return await this.paymentPlanService.updateRecordById(
      id,
      organization.id,
      updatePaymentPlanDto,
    );
  }
}
