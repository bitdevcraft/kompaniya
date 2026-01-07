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
import { type NewOrgTag, type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { type CreateTagDto } from './dto/create-tag.dto';
import { type DeleteTagsDto } from './dto/delete-tags.dto';
import { type UpdateTagDto } from './dto/update-tag.dto';
import { TagService } from './tag.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly drizzleErrorService: DrizzleErrorService,
  ) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createTagDto: CreateTagDto,
  ) {
    const record: NewOrgTag = {
      ...createTagDto,
      organizationId: organization.id,
    };

    await this.tagService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.tagService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.tagService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Tag doesn't exist");
    }

    return record;
  }

  @Get()
  async list(
    @Query('relatedType') relatedType: string,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.tagService.getRecordsByRelatedType(
      organization.id,
      relatedType,
    );
  }

  @Get('paginated')
  async paginatedData(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.tagService.getDataTable(
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
    const record = await this.tagService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Tag doesn't exist");
    }

    await this.tagService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.tagService.deleteRecordById(id, organization.id);
  }

  @Delete('bulk')
  async removeBulk(
    @Body() deleteTagsDto: DeleteTagsDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteTagsDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.tagService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.tagService.deleteRecordsByIds(ids, organization.id);
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
    @Body() updateTagDto: UpdateTagDto,
  ) {
    const record = await this.tagService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Tag doesn't exist");
    }

    await this.tagService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.tagService.deleteCacheById(record.id, organization.id);

    return await this.tagService.updateRecordById(
      id,
      organization.id,
      updateTagDto,
    );
  }
}
