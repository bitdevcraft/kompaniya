import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgEmailCampaign,
  OrgEmailCampaign,
  orgEmailCampaignRecipientsTable,
  orgEmailCampaignsTable,
} from '@repo/database/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';

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

  async getRecipients(
    campaignId: string,
    organizationId: string,
    options?: {
      status?: 'PENDING' | 'QUEUED' | 'SENT' | 'FAILED' | 'BOUNCED';
      isTest?: boolean;
      page?: number;
      perPage?: number;
    },
  ) {
    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 50;
    const offset = (page - 1) * perPage;

    const conditions = [
      eq(orgEmailCampaignRecipientsTable.organizationId, organizationId),
      eq(orgEmailCampaignRecipientsTable.orgEmailCampaignId, campaignId),
    ];

    if (options?.status) {
      conditions.push(
        eq(orgEmailCampaignRecipientsTable.status, options.status),
      );
    }

    if (options?.isTest !== undefined) {
      conditions.push(
        eq(orgEmailCampaignRecipientsTable.isTest, options.isTest),
      );
    }

    const [rows, totals] = await Promise.all([
      this.db.query.orgEmailCampaignRecipientsTable.findMany({
        where: and(...conditions),
        limit: perPage,
        offset,
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      }),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orgEmailCampaignRecipientsTable)
        .where(and(...conditions)),
    ]);

    const total = totals[0]?.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / perPage));

    return {
      data: rows,
      page,
      perPage,
      total,
      pageCount,
    };
  }

  async getRecipientStats(campaignId: string, organizationId: string) {
    const rows = await this.db
      .select({
        status: orgEmailCampaignRecipientsTable.status,
        isTest: orgEmailCampaignRecipientsTable.isTest,
        count: sql<number>`count(*)::int`,
      })
      .from(orgEmailCampaignRecipientsTable)
      .where(
        and(
          eq(orgEmailCampaignRecipientsTable.orgEmailCampaignId, campaignId),
          eq(orgEmailCampaignRecipientsTable.organizationId, organizationId),
        ),
      )
      .groupBy(
        orgEmailCampaignRecipientsTable.status,
        orgEmailCampaignRecipientsTable.isTest,
      );

    const buildStats = (isTest: boolean) => {
      const filtered = rows.filter((row) => Boolean(row.isTest) === isTest);
      const byStatus = Object.fromEntries(
        filtered.map((row) => [row.status, row.count]),
      ) as Record<string, number>;
      const total = filtered.reduce((sum, row) => sum + row.count, 0);

      return {
        total,
        pending: byStatus.PENDING ?? 0,
        queued: byStatus.QUEUED ?? 0,
        sent: byStatus.SENT ?? 0,
        failed: byStatus.FAILED ?? 0,
        bounced: byStatus.BOUNCED ?? 0,
      };
    };

    return {
      primary: buildStats(false),
      test: buildStats(true),
    };
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
