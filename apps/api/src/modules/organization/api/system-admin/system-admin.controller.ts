import type { Request as ExpressRequest } from 'express';

import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { AuthService, Roles } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from 'src/modules/auth/auth';

import { OrganizationLimitExceededException } from '~/modules/core/organization-limits/organization-limit-exceeded.exception';
import { OrganizationLimitsService } from '~/modules/core/organization-limits/organization-limits.service';
import { LimitType } from '~/modules/core/organization-limits/types';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { CreateUserDto, RoleOrRoles } from './dto/create-user.dto';
import { SystemAdminService } from './system-admin.service';

@UseGuards(ActiveOrganizationGuard)
@Roles(['superAdmin', 'systemAdmin'])
@Controller('api/organization/system-admin')
export class SystemAdminController {
  constructor(
    private authService: AuthService<typeof auth>,
    private systemAdminService: SystemAdminService,
    private organizationLimitsService: OrganizationLimitsService,
  ) {}

  @Post('create-user')
  async createUser(
    @Request() req: ExpressRequest,
    @Body() dto: CreateUserDto,
    @ActiveOrganization() organization: Organization,
  ) {
    // Check user limit before creating
    const limitCheck = await this.organizationLimitsService.checkUserLimit(
      organization.id,
    );

    if (!limitCheck.allowed) {
      throw new OrganizationLimitExceededException(
        LimitType.USERS,
        limitCheck.current,
        limitCheck.limit!,
      );
    }

    const headers = fromNodeHeaders(req.headers);

    const hasAdmin = (v: RoleOrRoles): boolean =>
      Array.isArray(v) ? v.includes('admin') : v === 'admin';

    const newUser = await this.authService.api.createUser({
      body: {
        email: dto.email,
        password: dto.password,
        name: dto.name,
        role: hasAdmin(dto.role) ? 'systemAdmin' : 'systemUser',
      },
      headers,
    });

    await this.authService.api.addMember({
      body: {
        userId: newUser.user.id,
        role: dto.role ?? 'member',
        organizationId: organization?.id,
      },
      headers,
    });

    // Invalidate cache after adding member
    await this.organizationLimitsService.invalidateCache(organization.id);

    return { userId: newUser.user.id };
  }

  @Put('deactivate-user/:id')
  async deactivateUser(
    @Param('id') id: string,
    @ActiveOrganization() organization: Organization,
  ) {
    const user = await this.systemAdminService.getUserById(id);

    if (
      !user ||
      user.members.length === 0 ||
      !user.members[0] ||
      !organization ||
      user.members[0].organizationId !== organization.id
    ) {
      throw new UnauthorizedException('Admin Session has no Organization');
    }

    const membership = await this.systemAdminService.getUserMembership(
      user.id,
      organization.id,
    );

    if (membership?.role === 'owner') {
      return;
    }

    await this.systemAdminService.deactivateUser(id);
  }
}
