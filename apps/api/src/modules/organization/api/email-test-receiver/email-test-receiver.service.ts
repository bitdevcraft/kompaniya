import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgEmailTestReceiver,
  OrgEmailTestReceiver,
  orgEmailTestReceiversTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class EmailTestReceiverService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(
    record: NewOrgEmailTestReceiver,
  ): Promise<OrgEmailTestReceiver[]> {
    return await this.db
      .insert(orgEmailTestReceiversTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.EmailTestReceiver.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailTestReceiver.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.EmailTestReceiver.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailTestReceiver[]> {
    await this.cacheService.delete(
      Keys.EmailTestReceiver.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgEmailTestReceiversTable)
      .where(
        and(
          eq(orgEmailTestReceiversTable.id, id),
          eq(orgEmailTestReceiversTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgEmailTestReceiver[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgEmailTestReceiversTable)
      .where(
        and(
          eq(orgEmailTestReceiversTable.organizationId, organizationId),
          inArray(orgEmailTestReceiversTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.EmailTestReceiver.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailTestReceiver.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.EmailTestReceiver.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgEmailTestReceiversTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailTestReceiver | undefined> {
    return this.cacheService.wrapCache<OrgEmailTestReceiver | undefined>({
      key: Keys.EmailTestReceiver.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgEmailTestReceiversTable.findFirst({
          where: and(
            eq(orgEmailTestReceiversTable.id, id),
            eq(orgEmailTestReceiversTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgEmailTestReceiver>,
  ): Promise<OrgEmailTestReceiver[]> {
    return await this.db
      .update(orgEmailTestReceiversTable)
      .set(record)
      .where(
        and(
          eq(orgEmailTestReceiversTable.id, id),
          eq(orgEmailTestReceiversTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
