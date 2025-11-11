import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgRealEstatePaymentPlan,
  OrgRealEstatePaymentPlan,
  orgRealEstatePaymentPlansTable,
} from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class RealEstatePaymentPlanService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(
    record: NewOrgRealEstatePaymentPlan,
  ): Promise<OrgRealEstatePaymentPlan[]> {
    return await this.db
      .insert(orgRealEstatePaymentPlansTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.RealEstatePaymentPlan.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstatePaymentPlan.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.RealEstatePaymentPlan.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstatePaymentPlan[]> {
    await this.cacheService.delete(
      Keys.RealEstatePaymentPlan.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgRealEstatePaymentPlansTable)
      .where(
        and(
          eq(orgRealEstatePaymentPlansTable.id, id),
          eq(orgRealEstatePaymentPlansTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.RealEstatePaymentPlan.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.RealEstatePaymentPlan.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.RealEstatePaymentPlan.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgRealEstatePaymentPlansTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgRealEstatePaymentPlan | undefined> {
    return this.cacheService.wrapCache<OrgRealEstatePaymentPlan | undefined>({
      key: Keys.RealEstatePaymentPlan.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgRealEstatePaymentPlansTable.findFirst({
          where: and(
            eq(orgRealEstatePaymentPlansTable.id, id),
            eq(orgRealEstatePaymentPlansTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgRealEstatePaymentPlan>,
  ): Promise<OrgRealEstatePaymentPlan[]> {
    return await this.db
      .update(orgRealEstatePaymentPlansTable)
      .set(record)
      .where(
        and(
          eq(orgRealEstatePaymentPlansTable.id, id),
          eq(orgRealEstatePaymentPlansTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
