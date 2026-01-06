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
import { type NewOrgCategory, type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { CategoryService } from './category.service';
import { type CreateCategoryDto } from './dto/create-category.dto';
import { type DeleteCategoriesDto } from './dto/delete-categories.dto';
import { type UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const record: NewOrgCategory = {
      ...createCategoryDto,
      organizationId: organization.id,
    };

    await this.categoryService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.categoryService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.categoryService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Category doesn't exist");
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
    return await this.categoryService.getDataTable(
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
    const record = await this.categoryService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Category doesn't exist");
    }

    await this.categoryService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.categoryService.deleteRecordById(id, organization.id);
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteCategoriesDto: DeleteCategoriesDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteCategoriesDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.categoryService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.categoryService.deleteRecordsByIds(
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
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const record = await this.categoryService.getRecordById(
      id,
      organization.id,
    );

    if (!record) {
      throw new NotFoundException("Category doesn't exist");
    }

    await this.categoryService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.categoryService.deleteCacheById(record.id, organization.id);

    return await this.categoryService.updateRecordById(
      id,
      organization.id,
      updateCategoryDto,
    );
  }
}
