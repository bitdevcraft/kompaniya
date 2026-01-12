import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { SuperAdminService } from './super-admin.service';

@Roles(['superAdmin'])
@Controller('api/super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('organizations/r/:id')
  async getOrganization(@Param('id') id: string) {
    const organization = await this.superAdminService.getOrganizationById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  @Get('organizations')
  async listOrganizations(
    @Query(new ZodValidationPipe(paginationQueryParserSchema))
    query: PaginationQueryParserType,
    @Session() session: UserSession,
  ) {
    return await this.superAdminService.getPaginatedOrganizations(
      session.user.id,
      query,
    );
  }
}
