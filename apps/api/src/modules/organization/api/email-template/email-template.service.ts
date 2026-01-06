import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgEmailTemplate,
  OrgEmailTemplate,
  orgEmailTemplatesTable,
} from '@repo/database/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class EmailTemplateService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
  ) {}

  async createTemplate(
    template: NewOrgEmailTemplate,
  ): Promise<OrgEmailTemplate[]> {
    return await this.db
      .insert(orgEmailTemplatesTable)
      .values(template)
      .returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(
      Keys.EmailTemplate.idByOrg(id, organizationId),
    );
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailTemplate.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.EmailTemplate.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailTemplate[]> {
    await this.cacheService.delete(
      Keys.EmailTemplate.idByOrg(id, organizationId),
    );

    return await this.db
      .delete(orgEmailTemplatesTable)
      .where(
        and(
          eq(orgEmailTemplatesTable.id, id),
          eq(orgEmailTemplatesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgEmailTemplate[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgEmailTemplatesTable)
      .where(
        and(
          eq(orgEmailTemplatesTable.organizationId, organizationId),
          inArray(orgEmailTemplatesTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    const cacheKey = `${Keys.EmailTemplate.paginated(userId, organizationId)}-${JSON.stringify(query)}`;

    let paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailTemplate.paginatedList(userId, organizationId),
    );

    paginationCache = paginationCache
      ? [...paginationCache, cacheKey]
      : [cacheKey];

    await this.cacheService.set(
      Keys.EmailTemplate.paginatedList(userId, organizationId),
      paginationCache,
    );

    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgEmailTemplatesTable,
      cacheKey,
      query,
      organizationId,
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgEmailTemplate | undefined> {
    return this.cacheService.wrapCache<OrgEmailTemplate | undefined>({
      key: Keys.EmailTemplate.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgEmailTemplatesTable.findFirst({
          where: and(
            eq(orgEmailTemplatesTable.id, id),
            eq(orgEmailTemplatesTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgEmailTemplate>,
  ): Promise<OrgEmailTemplate[]> {
    return await this.db
      .update(orgEmailTemplatesTable)
      .set(record)
      .where(
        and(
          eq(orgEmailTemplatesTable.id, id),
          eq(orgEmailTemplatesTable.organizationId, organizationId),
        ),
      )
      .returning();
  }
}
