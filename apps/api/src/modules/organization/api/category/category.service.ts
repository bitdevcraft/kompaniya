import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgCategory,
  orgCategoriesTable,
  OrgCategory,
} from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(record: NewOrgCategory): Promise<OrgCategory[]> {
    return await this.db.insert(orgCategoriesTable).values(record).returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Category.idByOrg(id, organizationId));
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Category.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Category.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgCategory[]> {
    await this.cacheService.delete(Keys.Category.idByOrg(id, organizationId));

    return await this.db
      .delete(orgCategoriesTable)
      .where(
        and(
          eq(orgCategoriesTable.id, id),
          eq(orgCategoriesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Category.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Category.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Category.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgCategoriesTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgCategory | undefined> {
    return this.cacheService.wrapCache<OrgCategory | undefined>({
      key: Keys.Category.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgCategoriesTable.findFirst({
          where: and(
            eq(orgCategoriesTable.id, id),
            eq(orgCategoriesTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgCategory>,
  ): Promise<OrgCategory[]> {
    return await this.db
      .update(orgCategoriesTable)
      .set(record)
      .where(
        and(
          eq(orgCategoriesTable.id, id),
          eq(orgCategoriesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
