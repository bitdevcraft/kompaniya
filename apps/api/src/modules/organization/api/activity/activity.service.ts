import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgActivity,
  orgActivitiesTable,
  OrgActivity,
} from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class ActivityService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(record: NewOrgActivity): Promise<OrgActivity[]> {
    return await this.db.insert(orgActivitiesTable).values(record).returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Activity.idByOrg(id, organizationId));
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Activity.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Activity.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgActivity[]> {
    await this.cacheService.delete(Keys.Activity.idByOrg(id, organizationId));

    return await this.db
      .delete(orgActivitiesTable)
      .where(
        and(
          eq(orgActivitiesTable.id, id),
          eq(orgActivitiesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Activity.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Activity.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Activity.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgActivitiesTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgActivity | undefined> {
    return this.cacheService.wrapCache<OrgActivity | undefined>({
      key: Keys.Activity.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgActivitiesTable.findFirst({
          where: and(
            eq(orgActivitiesTable.id, id),
            eq(orgActivitiesTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgActivity>,
  ): Promise<OrgActivity[]> {
    return await this.db
      .update(orgActivitiesTable)
      .set(record)
      .where(
        and(
          eq(orgActivitiesTable.id, id),
          eq(orgActivitiesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
