import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { NewOrgTag, OrgTag, orgTagsTable } from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class TagService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(record: NewOrgTag): Promise<OrgTag[]> {
    return await this.db.insert(orgTagsTable).values(record).returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Tag.idByOrg(id, organizationId));
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Tag.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Tag.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgTag[]> {
    await this.cacheService.delete(Keys.Tag.idByOrg(id, organizationId));

    return await this.db
      .delete(orgTagsTable)
      .where(
        and(
          eq(orgTagsTable.id, id),
          eq(orgTagsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgTag[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgTagsTable)
      .where(
        and(
          eq(orgTagsTable.organizationId, organizationId),
          inArray(orgTagsTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Tag.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Tag.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Tag.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgTagsTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgTag | undefined> {
    return this.cacheService.wrapCache<OrgTag | undefined>({
      key: Keys.Tag.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgTagsTable.findFirst({
          where: and(
            eq(orgTagsTable.id, id),
            eq(orgTagsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgTag>,
  ): Promise<OrgTag[]> {
    return await this.db
      .update(orgTagsTable)
      .set(record)
      .where(
        and(
          eq(orgTagsTable.id, id),
          eq(orgTagsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
