import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { ContactService } from './contact.service';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Delete('r/:id')
  async deleteRecord(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.contactService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Contact doesn't exist");
    }

    await this.contactService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.contactService.deleteRecordById(id, organization.id);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.contactService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Contact doesn't exist");
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
    return await this.contactService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }
}
