import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgRealEstateProject,
  OrgRealEstateProject,
  orgRealEstateProjectsTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class RealEstateProjectService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(
    record: NewOrgRealEstateProject,
  ): Promise<OrgRealEstateProject[]> {
    return await this.db
      .insert(orgRealEstateProjectsTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.RealEstateProject.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstateProject.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.RealEstateProject.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstateProject[]> {
    await this.cacheService.delete(
      Keys.RealEstateProject.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgRealEstateProjectsTable)
      .where(
        and(
          eq(orgRealEstateProjectsTable.id, id),
          eq(orgRealEstateProjectsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgRealEstateProject[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgRealEstateProjectsTable)
      .where(
        and(
          eq(orgRealEstateProjectsTable.organizationId, organizationId),
          inArray(orgRealEstateProjectsTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.RealEstateProject.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstateProject.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.RealEstateProject.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgRealEstateProjectsTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstateProject | undefined> {
    return this.cacheService.wrapCache<OrgRealEstateProject | undefined>({
      key: Keys.RealEstateProject.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgRealEstateProjectsTable.findFirst({
          where: and(
            eq(orgRealEstateProjectsTable.id, id),
            eq(orgRealEstateProjectsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgRealEstateProject>,
  ): Promise<OrgRealEstateProject[]> {
    return await this.db
      .update(orgRealEstateProjectsTable)
      .set(record)
      .where(
        and(
          eq(orgRealEstateProjectsTable.id, id),
          eq(orgRealEstateProjectsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
