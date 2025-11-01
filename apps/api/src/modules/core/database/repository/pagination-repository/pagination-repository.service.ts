import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { and, asc, count, desc, eq, isNull, Table } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { AnyPgTable } from 'drizzle-orm/pg-core';

import { DRIZZLE_DB } from '~/constants/provider';
import { filterColumns } from '~/lib/pagination/filter-columns';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';

@Injectable()
export class PaginationRepositoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async getPaginatedDataTable<
    T extends AnyPgTable & {
      deletedAt: AnyPgColumn;
      createdAt: AnyPgColumn;
      organizationId?: AnyPgColumn;
    },
  >({
    table,
    cacheKey,
    query,
    organizationId,
  }: {
    table: T;
    cacheKey: string;
    query: PaginationQueryParserType;
    organizationId?: string;
  }) {
    return await this.cacheService.wrapCache({
      key: cacheKey,
      fn: async () => {
        const offset = (query.page - 1) * query.perPage;
        const where = filterColumns({
          // @ts-expect-error id-union
          filters: query.filters,
          joinOperator: query.joinOperator,
          table,
        });

        const orderBy =
          query.sort.length > 0
            ? query.sort.map((item) =>
                item.desc
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    desc(table[item.id])
                  : // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    asc(table[item.id]),
              )
            : [asc(table.createdAt)];

        const data = await this.db
          .select()
          .from(table as unknown as Table)
          .where(
            and(
              where,
              isNull(table.deletedAt),
              organizationId && table.organizationId
                ? eq(table.organizationId, organizationId)
                : undefined,
            ),
          )
          .limit(query.perPage)
          .offset(offset)
          .orderBy(...orderBy);

        const total = await this.db
          .select({
            count: count(),
          })
          .from(table as unknown as Table)
          .where(
            and(
              where,
              isNull(table.deletedAt),
              organizationId && table.organizationId
                ? eq(table.organizationId, organizationId)
                : undefined,
            ),
          )
          .execute()
          .then((res) => res[0]?.count ?? 0);

        const pageCount = Math.ceil(total / query.perPage);

        return {
          data,
          pageCount,
        };
      },
    });
  }
}
