import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  membersTable,
  organizationRolesTable,
  organizationsTable,
  orgEmailDomainsTable,
  teamsTable,
  usersTable,
} from '@repo/database/schema';
import { Cacheable } from 'cacheable';
import { and, count, eq } from 'drizzle-orm';

import { CACHE_INSTANCE, DRIZZLE_DB } from '~/constants/provider';

import type { LimitCheckResult, OrganizationUsage } from './types';

@Injectable()
export class OrganizationLimitsService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase,
    @Inject(CACHE_INSTANCE) private readonly cache: Cacheable,
  ) {}

  /**
   * Check if organization can add more email domains
   * Throws OrganizationLimitExceededException if limit reached
   */
  async checkEmailDomainLimit(
    organizationId: string,
  ): Promise<LimitCheckResult> {
    const usage = await this.getOrganizationUsage(organizationId);
    const limit = usage.limits.numberOfEmailDomains;

    return {
      allowed: limit === null || usage.emailDomains < limit,
      current: usage.emailDomains,
      limit,
      remaining:
        limit === null ? null : Math.max(0, limit - usage.emailDomains - 1),
    };
  }

  /**
   * Check if organization can add more roles
   * Throws OrganizationLimitExceededException if limit reached
   */
  async checkRoleLimit(organizationId: string): Promise<LimitCheckResult> {
    const usage = await this.getOrganizationUsage(organizationId);
    const limit = usage.limits.numberOfRoles;

    return {
      allowed: limit === null || usage.roles < limit,
      current: usage.roles,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - usage.roles - 1),
    };
  }

  /**
   * Check if organization can add more teams
   * Throws OrganizationLimitExceededException if limit reached
   */
  async checkTeamLimit(organizationId: string): Promise<LimitCheckResult> {
    const usage = await this.getOrganizationUsage(organizationId);
    const limit = usage.limits.numberOfTeams;

    return {
      allowed: limit === null || usage.teams < limit,
      current: usage.teams,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - usage.teams - 1),
    };
  }

  /**
   * Check if organization can add more users (active members)
   * Throws OrganizationLimitExceededException if limit reached
   */
  async checkUserLimit(organizationId: string): Promise<LimitCheckResult> {
    const usage = await this.getOrganizationUsage(organizationId);
    const limit = usage.limits.numberOfUsers;

    return {
      allowed: limit === null || usage.users < limit,
      current: usage.users,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - usage.users - 1),
    };
  }

  /**
   * Get current usage and limits for an organization
   * Results are cached for 5 minutes
   */
  async getOrganizationUsage(
    organizationId: string,
  ): Promise<OrganizationUsage> {
    const cacheKey = `org-limits:${organizationId}:usage`;

    const cached = await this.cache.get<OrganizationUsage>(cacheKey);
    if (cached) {
      return cached;
    }

    const [users, emailDomains, roles, teams, org] = await Promise.all([
      this.countActiveUsers(organizationId),
      this.countEmailDomains(organizationId),
      this.countRoles(organizationId),
      this.countTeams(organizationId),
      this.getOrganization(organizationId),
    ]);

    if (!org) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }

    const result: OrganizationUsage = {
      users,
      emailDomains,
      roles,
      teams,
      limits: {
        numberOfUsers: org.numberOfUsers ?? null,
        numberOfEmailDomains: org.numberOfEmailDomains ?? null,
        numberOfRoles: org.numberOfRoles ?? null,
        numberOfTeams: org.numberOfTeams ?? null,
      },
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  /**
   * Invalidate cached usage data for an organization
   * Call this after creating/deleting resources
   */
  async invalidateCache(organizationId: string): Promise<void> {
    await this.cache.delete(`org-limits:${organizationId}:usage`);
  }

  /**
   * Count active users (where user.active = true) for an organization
   */
  private async countActiveUsers(organizationId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(membersTable)
      .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
      .where(
        and(
          eq(membersTable.organizationId, organizationId),
          eq(usersTable.active, true),
        ),
      );

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Count email domains for an organization
   */
  private async countEmailDomains(organizationId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(orgEmailDomainsTable)
      .where(eq(orgEmailDomainsTable.organizationId, organizationId));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Count custom roles for an organization
   */
  private async countRoles(organizationId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(organizationRolesTable)
      .where(eq(organizationRolesTable.organizationId, organizationId));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Count teams for an organization
   */
  private async countTeams(organizationId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(teamsTable)
      .where(eq(teamsTable.organizationId, organizationId));

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Get organization by id
   */
  private async getOrganization(organizationId: string) {
    const result = await this.db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1);

    return result[0];
  }
}
