import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgPaymentPlan,
  OrgPaymentPlan,
  orgPaymentPlansTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { type PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class PaymentPlanService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(record: NewOrgPaymentPlan): Promise<OrgPaymentPlan[]> {
    return await this.db
      .insert(orgPaymentPlansTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.PaymentPlan.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.PaymentPlan.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.PaymentPlan.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgPaymentPlan[]> {
    await this.cacheService.delete(
      Keys.PaymentPlan.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgPaymentPlansTable)
      .where(
        and(
          eq(orgPaymentPlansTable.id, id),
          eq(orgPaymentPlansTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgPaymentPlan[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgPaymentPlansTable)
      .where(
        and(
          eq(orgPaymentPlansTable.organizationId, organizationId),
          inArray(orgPaymentPlansTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.PaymentPlan.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.PaymentPlan.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.PaymentPlan.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgPaymentPlansTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgPaymentPlan | undefined> {
    return this.cacheService.wrapCache<OrgPaymentPlan | undefined>({
      key: Keys.PaymentPlan.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgPaymentPlansTable.findFirst({
          where: and(
            eq(orgPaymentPlansTable.id, id),
            eq(orgPaymentPlansTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgPaymentPlan>,
  ): Promise<OrgPaymentPlan[]> {
    return await this.db
      .update(orgPaymentPlansTable)
      .set(record)
      .where(
        and(
          eq(orgPaymentPlansTable.id, id),
          eq(orgPaymentPlansTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
