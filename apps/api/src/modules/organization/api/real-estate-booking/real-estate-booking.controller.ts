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
  type NewOrgRealEstateBooking,
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
import { type CreateRealEstateBookingDto } from './dto/create-real-estate-booking.dto';
import { type DeleteRealEstateBookingsDto } from './dto/delete-real-estate-bookings.dto';
import { type UpdateRealEstateBookingDto } from './dto/update-real-estate-booking.dto';
import { RealEstateBookingService } from './real-estate-booking.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-booking')
export class RealEstateBookingController {
  constructor(
    private readonly realEstateBookingService: RealEstateBookingService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createRealEstateBookingDto: CreateRealEstateBookingDto,
  ) {
    const record: NewOrgRealEstateBooking = {
      ...createRealEstateBookingDto,
      organizationId: organization.id,
    };

    await this.realEstateBookingService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstateBookingService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.realEstateBookingService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate booking doesn't exist");
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
    return await this.realEstateBookingService.getDataTable(
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
    const record = await this.realEstateBookingService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate booking doesn't exist");
    }

    await this.realEstateBookingService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.realEstateBookingService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.realEstateBookingService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteRealEstateBookingsDto: DeleteRealEstateBookingsDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteRealEstateBookingsDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.realEstateBookingService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.realEstateBookingService.deleteRecordsByIds(
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
    @Body() updateRealEstateBookingDto: UpdateRealEstateBookingDto,
  ) {
    const record = await this.realEstateBookingService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate booking doesn't exist");
    }

    await this.realEstateBookingService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.realEstateBookingService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.realEstateBookingService.updateRecordById(
      id,
      organization.id,
      updateRealEstateBookingDto,
    );
  }
}
