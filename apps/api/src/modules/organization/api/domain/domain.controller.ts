import {
  BadRequestException,
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
import { type Organization } from '@repo/database/schema';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { DrizzleErrorService } from '~/modules/core/database/drizzle-error';
import { OrganizationLimitExceededException } from '~/modules/core/organization-limits/organization-limit-exceeded.exception';
import { OrganizationLimitsService } from '~/modules/core/organization-limits/organization-limits.service';
import { LimitType } from '~/modules/core/organization-limits/types';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { type DeleteDomainsDto } from './dto/delete-domains.dto';
import { type UpdateDomainDto } from './dto/update-domain.dto';

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/domain')
export class DomainController {
  constructor(
    private readonly domainService: DomainService,
    private readonly drizzleErrorService: DrizzleErrorService,
    private readonly organizationLimitsService: OrganizationLimitsService,
  ) {}

  @Post()
  async add(
    @Body() createDomain: CreateDomainDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    // Check email domain limit before creating
    const limitCheck =
      await this.organizationLimitsService.checkEmailDomainLimit(
        organization.id,
      );

    if (!limitCheck.allowed) {
      throw new OrganizationLimitExceededException(
        LimitType.EMAIL_DOMAINS,
        limitCheck.current,
        limitCheck.limit!,
      );
    }

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

    const result = await this.domainService.createNewDomain(
      organization.id,
      domainName,
      createDomain.email,
    );

    // Invalidate cache after adding domain
    await this.organizationLimitsService.invalidateCache(organization.id);

    return result;
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

    await this.domainService.deleteDomainCache(domain);

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

  @Delete('bulk')
  async removeBulk(
    @Body() deleteDomainsDto: DeleteDomainsDto,
    @Session() session: UserSession,
    @ActiveOrganization() organization: Organization,
  ) {
    const ids = deleteDomainsDto?.ids ?? [];

    if (ids.length === 0) return [];

    await this.domainService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    try {
      return await this.domainService.deleteRecordsByIds(ids, organization.id);
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
    @Body() updateDomainDto: UpdateDomainDto,
  ) {
    const domain = await this.domainService.getDomainById(id, organization.id);

    if (!domain) {
      throw new NotFoundException("Domain doesn't exist");
    }

    await this.domainService.deleteDomainCache(domain);

    await this.domainService.deletePaginatedCache(
      session.user.id,
      organization.id,
    );

    return await this.domainService.updateDomain(
      id,
      organization.id,
      updateDomainDto,
    );
  }
}
