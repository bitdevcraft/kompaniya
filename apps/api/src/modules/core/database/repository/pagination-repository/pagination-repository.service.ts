import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  InferSelectModel,
  isNull,
  Table,
} from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { AnyPgTable } from 'drizzle-orm/pg-core';

import { DRIZZLE_DB } from '~/constants/provider';
import {
  filterColumns,
  getCustomFieldKey,
  isCustomFieldId,
} from '~/lib/pagination/filter-columns';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { CustomFieldQueryService } from '~/modules/core/custom-fields/custom-field-query.service';

@Injectable()
export class PaginationRepositoryService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
    private readonly customFieldQueryService: CustomFieldQueryService,
  ) {}

  async getPaginatedDataTable<
    T extends AnyPgTable & {
      deletedAt?: AnyPgColumn;
      createdAt: AnyPgColumn;
      name: AnyPgColumn;
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
  }): Promise<{ data: InferSelectModel<T>[]; pageCount: number }> {
    const result = await this.cacheService.wrapCache<{
      data: InferSelectModel<T>[];
      pageCount: number;
    }>({
      key: cacheKey,
      fn: async () => {
        const offset = (query.page - 1) * query.perPage;
        const where = filterColumns({
          // @ts-expect-error id-union
          filters: query.filters ?? [],
          joinOperator: query.joinOperator,
          table,
        });

        // Build orderBy array - handle both regular columns and custom fields
        const orderBy =
          query.sort.length > 0
            ? query.sort.map((item) => {
                // Check if this is a custom field sort
                if (isCustomFieldId(item.id)) {
                  // Use CustomFieldQueryService for custom field sorting
                  const key = getCustomFieldKey(item.id);
                  return this.customFieldQueryService.buildSortCondition(
                    table,
                    key,
                    item.desc ? 'desc' : 'asc',
                  );
                }
                // Regular column sort
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return item.desc ? desc(table[item.id]) : asc(table[item.id]);
              })
            : [asc(table.createdAt)];

        const data = (await this.db
          .select()
          .from(table as unknown as Table)
          .where(
            and(
              where,
              table.deletedAt ? isNull(table.deletedAt) : undefined,
              organizationId && table.organizationId
                ? eq(table.organizationId, organizationId)
                : undefined,
              query.name ? ilike(table.name, `%${query.name}%`) : undefined,
            ),
          )
          .limit(query.perPage)
          .offset(offset)
          .orderBy(...orderBy)) as InferSelectModel<T>[];

        const total = await this.db
          .select({
            count: count(),
          })
          .from(table as unknown as Table)
          .where(
            and(
              where,
              table.deletedAt ? isNull(table.deletedAt) : undefined,
              organizationId && table.organizationId
                ? eq(table.organizationId, organizationId)
                : undefined,
              query.name ? ilike(table.name, `%${query.name}%`) : undefined,
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

    return result ?? { data: [], pageCount: 0 };
  }
}
