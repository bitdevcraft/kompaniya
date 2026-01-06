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
  type NewOrgPaymentPlanTemplate,
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
import { type CreatePaymentPlanTemplateDto } from './dto/create-payment-plan-template.dto';
import { type DeletePaymentPlanTemplatesDto } from './dto/delete-payment-plan-templates.dto';
import { type UpdatePaymentPlanTemplateDto } from './dto/update-payment-plan-template.dto';
import { PaymentPlanTemplateService } from './payment-plan-template.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/payment-plan-template')
export class PaymentPlanTemplateController {
  constructor(
    private readonly paymentPlanTemplateService: PaymentPlanTemplateService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createPaymentPlanTemplateDto: CreatePaymentPlanTemplateDto,
  ) {
    const record: NewOrgPaymentPlanTemplate = {
      ...createPaymentPlanTemplateDto,
      organizationId: organization.id,
    };

    await this.paymentPlanTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.paymentPlanTemplateService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.paymentPlanTemplateService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Payment plan template doesn't exist");
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
    return await this.paymentPlanTemplateService.getDataTable(
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
    const record = await this.paymentPlanTemplateService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Payment plan template doesn't exist");
    }

    await this.paymentPlanTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.paymentPlanTemplateService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.paymentPlanTemplateService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deletePaymentPlanTemplatesDto: DeletePaymentPlanTemplatesDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deletePaymentPlanTemplatesDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.paymentPlanTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.paymentPlanTemplateService.deleteRecordsByIds(
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
    @Body() updatePaymentPlanTemplateDto: UpdatePaymentPlanTemplateDto,
  ) {
    const record = await this.paymentPlanTemplateService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Payment plan template doesn't exist");
    }

    await this.paymentPlanTemplateService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.paymentPlanTemplateService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.paymentPlanTemplateService.updateRecordById(
      id,
      organization.id,
      updatePaymentPlanTemplateDto,
    );
  }
}
