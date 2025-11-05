import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgEmailTemplate,
  orgEmailTemplatesTable,
} from '@repo/database/schema';

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

  async createTemplate(template: NewOrgEmailTemplate) {
    return await this.db
      .insert(orgEmailTemplatesTable)
      .values(template)
      .returning();
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.EmailTemplate.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });
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
}
