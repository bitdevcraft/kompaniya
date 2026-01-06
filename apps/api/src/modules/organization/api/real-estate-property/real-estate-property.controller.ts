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
  type NewOrgRealEstateProperty,
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
import { type CreateRealEstatePropertyDto } from './dto/create-real-estate-property.dto';
import { type DeleteRealEstatePropertiesDto } from './dto/delete-real-estate-properties.dto';
import { type UpdateRealEstatePropertyDto } from './dto/update-real-estate-property.dto';
import { RealEstatePropertyService } from './real-estate-property.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-property')
export class RealEstatePropertyController {
  constructor(
    private readonly realEstatePropertyService: RealEstatePropertyService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createRealEstatePropertyDto: CreateRealEstatePropertyDto,
  ) {
    const record: NewOrgRealEstateProperty = {
      ...createRealEstatePropertyDto,
      organizationId: organization.id,
    };

    await this.realEstatePropertyService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstatePropertyService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.realEstatePropertyService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate property doesn't exist");
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
    return await this.realEstatePropertyService.getDataTable(
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
    const record = await this.realEstatePropertyService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate property doesn't exist");
    }

    await this.realEstatePropertyService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstatePropertyService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteRealEstatePropertiesDto: DeleteRealEstatePropertiesDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteRealEstatePropertiesDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.realEstatePropertyService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.realEstatePropertyService.deleteRecordsByIds(
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
    @Body() updateRealEstatePropertyDto: UpdateRealEstatePropertyDto,
  ) {
    const record = await this.realEstatePropertyService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate property doesn't exist");
    }

    await this.realEstatePropertyService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.realEstatePropertyService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.realEstatePropertyService.updateRecordById(
      id,
      organization.id,
      updateRealEstatePropertyDto,
    );
  }
}
