import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgEmailCampaign,
  OrgEmailCampaign,
  orgEmailCampaignsTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class EmailCampaignService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createNewRecord(
    record: NewOrgEmailCampaign,
  ): Promise<OrgEmailCampaign[]> {
    return await this.db
      .insert(orgEmailCampaignsTable)
      .values(record)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.EmailCampaign.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailCampaign.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.EmailCampaign.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailCampaign[]> {
    await this.cacheService.delete(
      Keys.EmailCampaign.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgEmailCampaignsTable)
      .where(
        and(
          eq(orgEmailCampaignsTable.id, id),
          eq(orgEmailCampaignsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgEmailCampaign[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgEmailCampaignsTable)
      .where(
        and(
          eq(orgEmailCampaignsTable.organizationId, organizationId),
          inArray(orgEmailCampaignsTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.EmailCampaign.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailCampaign.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.EmailCampaign.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgEmailCampaignsTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailCampaign | undefined> {
    return this.cacheService.wrapCache<OrgEmailCampaign | undefined>({
      key: Keys.EmailCampaign.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgEmailCampaignsTable.findFirst({
          where: and(
            eq(orgEmailCampaignsTable.id, id),
            eq(orgEmailCampaignsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgEmailCampaign>,
  ): Promise<OrgEmailCampaign[]> {
    return await this.db
      .update(orgEmailCampaignsTable)
      .set(record)
      .where(
        and(
          eq(orgEmailCampaignsTable.id, id),
          eq(orgEmailCampaignsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
