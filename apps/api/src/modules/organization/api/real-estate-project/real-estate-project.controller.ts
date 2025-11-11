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
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { type CreateRealEstateProjectDto } from './dto/create-real-estate-project.dto';
import { type UpdateRealEstateProjectDto } from './dto/update-real-estate-project.dto';
import { RealEstateProjectService } from './real-estate-project.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/real-estate-project')
export class RealEstateProjectController {
  constructor(
    private readonly realEstateProjectService: RealEstateProjectService,
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
