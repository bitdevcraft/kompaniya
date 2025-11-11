import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgRealEstateProperty,
  orgRealEstatePropertiesTable,
  OrgRealEstateProperty,
} from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class RealEstatePropertyService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(
    record: NewOrgRealEstateProperty,
  ): Promise<OrgRealEstateProperty[]> {
    return await this.db
      .insert(orgRealEstatePropertiesTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.RealEstateProperty.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstateProperty.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.RealEstateProperty.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstateProperty[]> {
    await this.cacheService.delete(
      Keys.RealEstateProperty.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgRealEstatePropertiesTable)
      .where(
        and(
          eq(orgRealEstatePropertiesTable.id, id),
          eq(orgRealEstatePropertiesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.RealEstateProperty.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstateProperty.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.RealEstateProperty.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgRealEstatePropertiesTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstateProperty | undefined> {
    return this.cacheService.wrapCache<OrgRealEstateProperty | undefined>({
      key: Keys.RealEstateProperty.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgRealEstatePropertiesTable.findFirst({
          where: and(
            eq(orgRealEstatePropertiesTable.id, id),
            eq(orgRealEstatePropertiesTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgRealEstateProperty>,
  ): Promise<OrgRealEstateProperty[]> {
    return await this.db
      .update(orgRealEstatePropertiesTable)
      .set(record)
      .where(
        and(
          eq(orgRealEstatePropertiesTable.id, id),
          eq(orgRealEstatePropertiesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
