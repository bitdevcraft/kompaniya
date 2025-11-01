import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { orgEmailDomainsTable } from '@repo/database/schema';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

@Injectable()
export class DomainService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
    private readonly paginationRepositoryService: PaginationRepositoryService,
  ) {}

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    return await this.paginationRepositoryService.getPaginatedDataTable({
      table: orgEmailDomainsTable,
      cacheKey: `${Keys.Domain.paginated(userId, organizationId)}-${JSON.stringify(query)}`,
      query,
      organizationId,
    });
  }
}
