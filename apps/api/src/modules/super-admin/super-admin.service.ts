import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  membersTable,
  organizationRolesTable,
  organizationsTable,
  teamsTable,
} from '@repo/database/schema';
import { count, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

type OrganizationUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  active: boolean | null;
};

@Injectable()
export class SuperAdminService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async deletePaginatedCache(userId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.SuperAdminOrganization.paginatedList(userId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.SuperAdminOrganization.paginatedList(userId),
    );
  }

  async getOrganizationById(id: string) {
    return this.cacheService.wrapCache({
      key: Keys.SuperAdminOrganization.id(id),
      fn: async () => {
        const organization = await this.db.query.organizationsTable.findFirst({
          where: eq(organizationsTable.id, id),
          with: {
            members: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    active: true,
                  },
                },
              },
            },
            teams: {
              with: {
                teamMembers: {
                  with: {
                    user: {
                      columns: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                        active: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!organization) {
          return null;
        }

        const roles = await this.db.query.organizationRolesTable.findMany({
          where: eq(organizationRolesTable.organizationId, id),
        });

        return {
          ...organization,
          roles: roles ?? [],
          members: organization.members.map((member) => ({
            id: member.id,
            role: member.role,
            createdAt: member.createdAt,
            user: member.user as OrganizationUser | null,
          })),
          teams: organization.teams.map((team) => ({
            id: team.id,
            name: team.name,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            teamMembers: team.teamMembers.map((teamMember) => ({
              id: teamMember.id,
              userId: teamMember.userId,
              createdAt: teamMember.createdAt,
              user: teamMember.user as OrganizationUser | null,
            })),
          })),
        };
      },
    });
  }

  async getPaginatedOrganizations(
    userId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.SuperAdminOrganization.paginated(userId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.SuperAdminOrganization.paginatedList(userId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.SuperAdminOrganization.paginatedList(userId),
      paginationCache,
    );

    const paginated =
      await this.paginationRepositoryService.getPaginatedDataTable({
        table: organizationsTable,
        cacheKey,
        query,
      });

    if (!paginated) {
      return {
        data: [],
        pageCount: 0,
      };
    }

    const organizationIds = paginated.data.map((org) => org.id);

    if (organizationIds.length === 0) {
      return {
        data: [],
        pageCount: paginated.pageCount,
      };
    }

    const [memberCounts, roleCounts, teamCounts] = await Promise.all([
      this.db
        .select({
          organizationId: membersTable.organizationId,
          count: count(),
        })
        .from(membersTable)
        .where(inArray(membersTable.organizationId, organizationIds))
        .groupBy(membersTable.organizationId),
      this.db
        .select({
          organizationId: organizationRolesTable.organizationId,
          count: count(),
        })
        .from(organizationRolesTable)
        .where(inArray(organizationRolesTable.organizationId, organizationIds))
        .groupBy(organizationRolesTable.organizationId),
      this.db
        .select({
          organizationId: teamsTable.organizationId,
          count: count(),
        })
        .from(teamsTable)
        .where(inArray(teamsTable.organizationId, organizationIds))
        .groupBy(teamsTable.organizationId),
    ]);

    const memberCountMap = memberCounts.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.organizationId] = Number(item.count ?? 0);
        return acc;
      },
      {},
    );
    const roleCountMap = roleCounts.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.organizationId] = Number(item.count ?? 0);
        return acc;
      },
      {},
    );
    const teamCountMap = teamCounts.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.organizationId] = Number(item.count ?? 0);
        return acc;
      },
      {},
    );

    return {
      data: paginated.data.map((organization) => ({
        ...organization,
        memberCount: memberCountMap[organization.id] ?? 0,
        roleCount: roleCountMap[organization.id] ?? 0,
        teamCount: teamCountMap[organization.id] ?? 0,
      })),
      pageCount: paginated.pageCount,
    };
  }

  async updateOrganizationLimits(
    id: string,
    userId: string,
    limits: {
      numberOfUsers?: number | null;
      numberOfEmailDomains?: number | null;
      numberOfRoles?: number | null;
      numberOfTeams?: number | null;
    },
  ) {
    const updates: Partial<typeof organizationsTable.$inferInsert> = {};

    if (limits.numberOfUsers !== undefined) {
      updates.numberOfUsers = limits.numberOfUsers;
    }

    if (limits.numberOfEmailDomains !== undefined) {
      updates.numberOfEmailDomains = limits.numberOfEmailDomains;
    }

    if (limits.numberOfRoles !== undefined) {
      updates.numberOfRoles = limits.numberOfRoles;
    }

    if (limits.numberOfTeams !== undefined) {
      updates.numberOfTeams = limits.numberOfTeams;
    }

    if (Object.keys(updates).length === 0) {
      return await this.getOrganizationById(id);
    }

    const updated = await this.db
      .update(organizationsTable)
      .set(updates)
      .where(eq(organizationsTable.id, id))
      .returning();

    if (updated.length === 0) {
      return null;
    }

    await this.cacheService.delete(Keys.SuperAdminOrganization.id(id));
    await this.deletePaginatedCache(userId);

    return await this.getOrganizationById(id);
  }
}
