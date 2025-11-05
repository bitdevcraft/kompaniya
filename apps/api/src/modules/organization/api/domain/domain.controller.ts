import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
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
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  async add(
    @Body() createDomain: CreateDomainDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const domainName = createDomain.email.split('@')[1];

    if (!domainName) return;

    const existingDomain = await this.domainService.getDomainByName(domainName);

    if (existingDomain) {
      throw new BadRequestException(
        'Domain is already existing, Please change into different Organization',
      );
    }

    await this.domainService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.domainService.createNewDomain(
      organization.id,
      domainName,
      createDomain.email,
    );
  }

  @Delete('r/:id')
  async deleteRecord(
    @Param('id') id: string,
    @Session() session: UserSession,

    @ActiveOrganization() organization: Organization,
  ) {
    const domain = await this.domainService.getDomainById(id, organization.id);

    if (!domain) {
      throw new NotFoundException("Domain doesn't exist");
    }

    await this.domainService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.domainService.deleteDomain(id, organization.id);
  }

  @Get('r/:id')
  async findOne(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const domain = await this.domainService.getDomainById(id, organization.id);

    if (!domain || !domain.email) {
      throw new NotFoundException("Domain doesn't exist");
    }

    const attributes = await this.domainService.getIdentityAttributes(
      domain.email,
    );

    return {
      data: domain,
      tokens: attributes?.tokens,
    };
  }

  @Get('paginated')
  async paginatedData(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    return await this.domainService.getDataTable(
      session.user.id,
      organization.id,
      query,
    );
  }
}
