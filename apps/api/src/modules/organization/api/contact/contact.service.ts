import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { orgContactsTable } from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class ContactService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Contact.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });
  }

  async deleteRecordById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Contact.idByOrg(id, organizationId));

    return await this.db
      .delete(orgContactsTable)
      .where(eq(orgContactsTable.id, id))
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgContactsTable,
      cacheKey: `${Keys.Contact.paginated(userId, organizationId)}-${JSON.stringify(query)}`,
      query,
      organizationId,
    });
  }

  async getRecordById(id: string, organizationId: string) {
    return this.cacheService.wrapCache({
      key: Keys.Contact.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgContactsTable.findFirst({
          where: and(
            eq(orgContactsTable.id, id),
            eq(orgContactsTable.organizationId, organizationId),
          ),
        }),
    });
  }
}
