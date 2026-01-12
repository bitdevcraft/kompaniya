import type { Request as ExpressRequest } from 'express';

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { type Organization } from '@repo/database/schema';
import { orgAdmin, orgMember, orgOwner } from '@repo/shared';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from '~/modules/auth/auth';

import { ActiveOrganization } from '../../decorator/active-organization/active-organization.decorator';
import { ActiveOrganizationGuard } from '../../guards/active-organization/active-organization.guard';
import { UserService } from './user.service';

type OrganizationRole = {
  id: string;
  organizationId: string;
  role: string;
  permission: string | Record<string, string[]>;
  createdAt: Date;
  updatedAt: Date | null;
};

@UseGuards(ActiveOrganizationGuard)
@Controller('api/organization/user')
export class UserController {
  constructor(
    private authService: AuthService<typeof auth>,
    private userService: UserService,
  ) {}

  @Get('active-permissions')
  async getActivePermissions(
    @Request() req: ExpressRequest,
    @ActiveOrganization() organization: Organization,
  ) {
    const headers = fromNodeHeaders(req.headers);

    const [activeMemberRole, orgRoles]: [
      unknown,
      OrganizationRole[] | undefined,
    ] = await Promise.all([
      this.authService.api.getActiveMemberRole({
        headers,
        query: {
          organizationId: organization.id,
        },
      }),
      this.userService.getOrgRoles(organization.id),
    ]);

    const activeMemberRoleData = activeMemberRole as { role: string } | null;
    const roleName = activeMemberRoleData?.role;

    const customRole = roleName
      ? orgRoles?.find((role) => role.role === roleName)
      : undefined;
    const customPermission = customRole?.permission;
    const parsedCustomPermissions =
      typeof customPermission === 'string'
        ? (JSON.parse(customPermission) as Record<string, string[]>)
        : (customPermission ?? {});

    const permissions =
      roleName === 'admin'
        ? orgAdmin.statements
        : roleName === 'owner'
          ? orgOwner.statements
          : roleName === 'member'
            ? orgMember.statements
            : parsedCustomPermissions;

    return { permissions };
  }
}
