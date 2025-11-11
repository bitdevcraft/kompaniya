import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgOpportunity,
  orgOpportunitiesTable,
  OrgOpportunity,
} from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class OpportunityService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(record: NewOrgOpportunity): Promise<OrgOpportunity[]> {
    return await this.db
      .insert(orgOpportunitiesTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.Opportunity.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Opportunity.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Opportunity.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgOpportunity[]> {
    await this.cacheService.delete(
      Keys.Opportunity.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgOpportunitiesTable)
      .where(
        and(
          eq(orgOpportunitiesTable.id, id),
          eq(orgOpportunitiesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.Opportunity.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.Opportunity.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.Opportunity.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgOpportunitiesTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgOpportunity | undefined> {
    return this.cacheService.wrapCache<OrgOpportunity | undefined>({
      key: Keys.Opportunity.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgOpportunitiesTable.findFirst({
          where: and(
            eq(orgOpportunitiesTable.id, id),
            eq(orgOpportunitiesTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgOpportunity>,
  ): Promise<OrgOpportunity[]> {
    return await this.db
      .update(orgOpportunitiesTable)
      .set(record)
      .where(
        and(
          eq(orgOpportunitiesTable.id, id),
          eq(orgOpportunitiesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
