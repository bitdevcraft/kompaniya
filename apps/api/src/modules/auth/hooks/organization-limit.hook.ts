import { Injectable } from '@nestjs/common';
import {
  type AuthHookContext,
  BeforeHook,
  Hook,
} from '@thallesp/nestjs-better-auth';
import { APIError } from 'better-auth';

import { OrganizationLimitsService } from '~/modules/core/organization-limits/organization-limits.service';

@Hook()
@Injectable()
export class OrganizationLimitHook {
  constructor(
    private readonly organizationLimitsService: OrganizationLimitsService,
  ) {}

  /**
   * Check user limit before adding a member to organization
   */
  @BeforeHook('/organization/add-member')
  async beforeAddMember(ctx: AuthHookContext) {
    const body = ctx.body as { organizationId: string };

    if (!body.organizationId) {
      throw new APIError('BAD_REQUEST', {
        message: 'Organization ID is required',
      });
    }

    const limitCheck = await this.organizationLimitsService.checkUserLimit(
      body.organizationId,
    );

    if (!limitCheck.allowed) {
      throw new APIError('FORBIDDEN', {
        message: `Organization user limit exceeded. Current: ${limitCheck.current}, Limit: ${limitCheck.limit}`,
        errorCode: 'ORG_USER_LIMIT_EXCEEDED',
      });
    }
  }

  /**
   * Check team limit before creating a new team
   */
  @BeforeHook('/organization/create-team')
  async beforeCreateTeam(ctx: AuthHookContext) {
    const body = ctx.body as { organizationId?: string };

    if (!body.organizationId) {
      return;
    }

    const limitCheck = await this.organizationLimitsService.checkTeamLimit(
      body.organizationId,
    );

    if (!limitCheck.allowed) {
      throw new APIError('FORBIDDEN', {
        message: `Organization team limit exceeded. Current: ${limitCheck.current}, Limit: ${limitCheck.limit}`,
        errorCode: 'ORG_TEAM_LIMIT_EXCEEDED',
      });
    }
  }

  /**
   * Check role limit before creating a new role
   */
  @BeforeHook('/organization/set-role')
  async beforeSetRole(ctx: AuthHookContext) {
    const body = ctx.body as { organizationId?: string };

    if (!body.organizationId) {
      return;
    }

    const limitCheck = await this.organizationLimitsService.checkRoleLimit(
      body.organizationId,
    );

    if (!limitCheck.allowed) {
      throw new APIError('FORBIDDEN', {
        message: `Organization role limit exceeded. Current: ${limitCheck.current}, Limit: ${limitCheck.limit}`,
        errorCode: 'ORG_ROLE_LIMIT_EXCEEDED',
      });
    }
  }
}
