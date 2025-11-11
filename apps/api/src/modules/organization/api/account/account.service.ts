import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgAccount,
  OrgAccount,
  orgAccountsTable,
} from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class AccountService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(record: NewOrgAccount): Promise<OrgAccount[]> {
    return await this.db.insert(orgAccountsTable).values(record).returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Account.idByOrg(id, organizationId));
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Account.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Account.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgAccount[]> {
    await this.cacheService.delete(Keys.Account.idByOrg(id, organizationId));

    return await this.db
      .delete(orgAccountsTable)
      .where(
        and(
          eq(orgAccountsTable.id, id),
          eq(orgAccountsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Account.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Account.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Account.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgAccountsTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgAccount | undefined> {
    return this.cacheService.wrapCache<OrgAccount | undefined>({
      key: Keys.Account.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgAccountsTable.findFirst({
          where: and(
            eq(orgAccountsTable.id, id),
            eq(orgAccountsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgAccount>,
  ): Promise<OrgAccount[]> {
    return await this.db
      .update(orgAccountsTable)
      .set(record)
      .where(
        and(
          eq(orgAccountsTable.id, id),
          eq(orgAccountsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
