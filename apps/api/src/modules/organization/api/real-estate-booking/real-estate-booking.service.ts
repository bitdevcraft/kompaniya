import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgRealEstateBooking,
  OrgRealEstateBooking,
  orgRealEstateBookingsTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class RealEstateBookingService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(
    record: NewOrgRealEstateBooking,
  ): Promise<OrgRealEstateBooking[]> {
    return await this.db
      .insert(orgRealEstateBookingsTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.RealEstateBooking.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstateBooking.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.RealEstateBooking.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstateBooking[]> {
    await this.cacheService.delete(
      Keys.RealEstateBooking.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgRealEstateBookingsTable)
      .where(
        and(
          eq(orgRealEstateBookingsTable.id, id),
          eq(orgRealEstateBookingsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgRealEstateBooking[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgRealEstateBookingsTable)
      .where(
        and(
          eq(orgRealEstateBookingsTable.organizationId, organizationId),
          inArray(orgRealEstateBookingsTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.RealEstateBooking.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstateBooking.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.RealEstateBooking.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgRealEstateBookingsTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstateBooking | undefined> {
    return this.cacheService.wrapCache<OrgRealEstateBooking | undefined>({
      key: Keys.RealEstateBooking.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgRealEstateBookingsTable.findFirst({
          where: and(
            eq(orgRealEstateBookingsTable.id, id),
            eq(orgRealEstateBookingsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgRealEstateBooking>,
  ): Promise<OrgRealEstateBooking[]> {
    return await this.db
      .update(orgRealEstateBookingsTable)
      .set(record)
      .where(
        and(
          eq(orgRealEstateBookingsTable.id, id),
          eq(orgRealEstateBookingsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
