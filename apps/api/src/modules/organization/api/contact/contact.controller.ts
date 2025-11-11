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
import { type NewOrgContact, type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { ContactService } from './contact.service';
import { type CreateContactDto } from './dto/create-contact.dto';
import { type UpdateContactDto } from './dto/update-contact.dto';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createContactDto: CreateContactDto,
  ) {
    const record: NewOrgContact = {
      ...createContactDto,
      organizationId: organization.id,
    };

    await this.contactService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.contactService.createNewRecord(record);
  }

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

    await this.contactService.deleteCacheById(record.id, organization.id);

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

  @Patch('r/:id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const record = await this.contactService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Contact doesn't exist");
    }

    await this.contactService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.contactService.deleteCacheById(record.id, organization.id);

    return await this.contactService.updateRecordById(
      id,
      organization.id,
      updateContactDto,
    );
  }
}
