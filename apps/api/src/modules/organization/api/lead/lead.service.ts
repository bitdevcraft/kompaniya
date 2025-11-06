import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { NewOrgLead, orgLeadsTable } from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class LeadService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Lead.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });
  }

  async deleteRecordById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Lead.idByOrg(id, organizationId));

    return await this.db
      .delete(orgLeadsTable)
      .where(eq(orgLeadsTable.id, id))
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Lead.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Lead.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Lead.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgLeadsTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(id: string, organizationId: string) {
    return this.cacheService.wrapCache({
      key: Keys.Contact.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgLeadsTable.findFirst({
          where: and(
            eq(orgLeadsTable.id, id),
            eq(orgLeadsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(id: string, record: NewOrgLead) {
    return await this.db
      .update(orgLeadsTable)
      .set(record)
      .where(eq(orgLeadsTable.id, id))
      .returning();
  }
}
