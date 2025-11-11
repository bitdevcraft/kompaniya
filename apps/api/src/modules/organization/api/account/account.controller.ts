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
import { type NewOrgAccount, type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { AccountService } from './account.service';
import { type CreateAccountDto } from './dto/create-account.dto';
import { type UpdateAccountDto } from './dto/update-account.dto';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(
    @ActiveOrganization() organization: Organization,
    @Session() session: UserSession,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    const record: NewOrgAccount = {
      ...createAccountDto,
      organizationId: organization.id,
    };

    await this.accountService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.accountService.createNewRecord(record);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const record = await this.accountService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Account doesn't exist");
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
    return await this.accountService.getDataTable(
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
    const record = await this.accountService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Account doesn't exist");
    }

    await this.accountService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.accountService.deleteRecordById(id, organization.id);
  }

  @Patch('r/:id')
  async update(
    @Param('id') id: string,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const record = await this.accountService.getRecordById(id, organization.id);

    if (!record) {
      throw new NotFoundException("Account doesn't exist");
    }

    await this.accountService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    await this.accountService.deleteCacheById(record.id, organization.id);

    return await this.accountService.updateRecordById(
      id,
      organization.id,
      updateAccountDto,
    );
  }
}
