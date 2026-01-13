import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { z } from 'zod';

import {
  paginationQueryParserSchema,
  type PaginationQueryParserType,
} from '~/lib/pagination/pagination-query-parser';
import { ZodValidationPipe } from '~/pipes/zod-validation-pipe';

import { SuperAdminService } from './super-admin.service';

const updateOrganizationLimitsSchema = z
  .object({
    numberOfUsers: z.number().int().min(0).nullable().optional(),
    numberOfEmailDomains: z.number().int().min(0).nullable().optional(),
    numberOfRoles: z.number().int().min(0).nullable().optional(),
    numberOfTeams: z.number().int().min(0).nullable().optional(),
  })
  .strict();

type UpdateOrganizationLimitsDto = z.infer<
  typeof updateOrganizationLimitsSchema
>;

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

  @Patch('organizations/r/:id')
  async updateOrganizationLimits(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(updateOrganizationLimitsSchema))
    body: UpdateOrganizationLimitsDto,
  ) {
    const organization = await this.superAdminService.updateOrganizationLimits(
      id,
      session.user.id,
      body,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }
}
