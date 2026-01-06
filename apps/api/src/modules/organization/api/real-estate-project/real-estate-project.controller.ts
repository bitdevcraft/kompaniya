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
  type NewOrgRealEstateProject,
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
import { type CreateRealEstateProjectDto } from './dto/create-real-estate-project.dto';
import { type DeleteRealEstateProjectsDto } from './dto/delete-real-estate-projects.dto';
import { type UpdateRealEstateProjectDto } from './dto/update-real-estate-project.dto';
import { RealEstateProjectService } from './real-estate-project.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-project')
export class RealEstateProjectController {
  constructor(
    private readonly realEstateProjectService: RealEstateProjectService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createRealEstateProjectDto: CreateRealEstateProjectDto,
  ) {
    const record: NewOrgRealEstateProject = {
      ...createRealEstateProjectDto,
      organizationId: organization.id,
    };

    await this.realEstateProjectService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstateProjectService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.realEstateProjectService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate project doesn't exist");
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
    return await this.realEstateProjectService.getDataTable(
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
    const record = await this.realEstateProjectService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate project doesn't exist");
    }

    await this.realEstateProjectService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.realEstateProjectService.deleteRecordById(
      id,
      organization.id,
    );
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteRealEstateProjectsDto: DeleteRealEstateProjectsDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteRealEstateProjectsDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.realEstateProjectService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.realEstateProjectService.deleteRecordsByIds(
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
    @Body() updateRealEstateProjectDto: UpdateRealEstateProjectDto,
  ) {
    const record = await this.realEstateProjectService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Real estate project doesn't exist");
    }

    await this.realEstateProjectService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.realEstateProjectService.deleteCacheById(
      record.id,
      organization.id,
    );

    return await this.realEstateProjectService.updateRecordById(
      id,
      organization.id,
      updateRealEstateProjectDto,
    );
  }
}
