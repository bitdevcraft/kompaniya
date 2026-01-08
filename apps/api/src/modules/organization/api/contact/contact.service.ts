import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  NewOrgContact,
  OrgContact,
  orgContactsTable,
} from '@repo/database/schema';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  type SQL,
} from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import {
  filterColumns,
  getCustomFieldKey,
  isCustomFieldId,
  separateFilters,
} from '~/lib/pagination/filter-columns';
import { PaginationQueryParserType } from '~/lib/pagination/pagination-query-parser';
import { CacheService } from '~/modules/core/cache/cache.service';
import { CustomFieldQueryService } from '~/modules/core/custom-fields/custom-field-query.service';
import { CustomFieldValidationService } from '~/modules/core/custom-fields/custom-field-validation.service';
import { PaginationRepositoryService } from '~/modules/core/database/repository/pagination-repository/pagination-repository.service';

type CustomFieldFilterOperator =
  | 'exists'
  | 'eq'
  | 'neq'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'array_contains';

@Injectable()
export class ContactService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly paginationRepositoryService: PaginationRepositoryService,
    private readonly cacheService: CacheService,
    private readonly customFieldValidation: CustomFieldValidationService,
    private readonly customFieldQueryService: CustomFieldQueryService,
  ) {}

  async createNewRecord(record: NewOrgContact): Promise<OrgContact[]> {
    // Validate custom fields before creating
    if (record.customFields && Object.keys(record.customFields).length > 0) {
      if (!record.organizationId) {
        throw new BadRequestException('organizationId is required');
      }
      const validation = await this.customFieldValidation.validateCustomFields(
        record.organizationId,
        'org_contacts',
        record.customFields,
      );

      if (!validation.success) {
        throw new BadRequestException({
          message: 'Custom field validation failed',
          errors: validation.errors,
        });
      }

      // Use normalized values
      record.customFields = validation.normalized;
    }

    return await this.db.insert(orgContactsTable).values(record).returning();
  }

  async deleteCacheById(id: string, organizationId: string) {
    await this.cacheService.delete(Keys.Contact.idByOrg(id, organizationId));
  }

  async deletePaginatedCache(userId: string, organizationId: string) {
    const paginationCache = await this.cacheService.get<string[]>(
      Keys.Contact.paginatedList(userId, organizationId),
    );

    if (!paginationCache) return;

    paginationCache.forEach((key) => {
      void this.cacheService.delete(key);
    });

    await this.cacheService.delete(
      Keys.Contact.paginatedList(userId, organizationId),
    );
  }

  async deleteRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgContact[]> {
    await this.cacheService.delete(Keys.Contact.idByOrg(id, organizationId));

    return await this.db
      .delete(orgContactsTable)
      .where(
        and(
          eq(orgContactsTable.id, id),
          eq(orgContactsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  async deleteRecordsByIds(
    ids: string[],
    organizationId: string,
  ): Promise<OrgContact[]> {
    if (ids.length === 0) return [];

    const uniqueIds = [...new Set(ids)];

    await Promise.all(
      uniqueIds.map((id) => this.deleteCacheById(id, organizationId)),
    );

    return await this.db
      .delete(orgContactsTable)
      .where(
        and(
          eq(orgContactsTable.organizationId, organizationId),
          inArray(orgContactsTable.id, uniqueIds),
        ),
      )
      .returning();
  }

  async getDataTable(
    userId: string,
    organizationId: string,
    query: PaginationQueryParserType,
  ) {
    return await this.cacheService.wrapCache({
      key: `${Keys.Contact.paginated(userId, organizationId)}-${JSON.stringify(query)}`,
      fn: async () => {
        // Separate regular and custom field filters
        const { regularFilters, customFieldFilters } = separateFilters(
          // @ts-expect-error id-union
          query.filters ?? [],
        );

        // Map custom field filters to CustomFieldQueryService format
        const customFieldFilterItems = customFieldFilters.map((filter) => ({
          key: getCustomFieldKey(filter.id),
          operator: this.mapFilterOperator(filter.operator),
          value: filter.value,
        }));

        // Build filter conditions
        const regularWhere = filterColumns({
          filters: regularFilters,
          joinOperator: query.joinOperator,
          table: orgContactsTable,
        });

        // Build custom field filter condition
        let customFieldWhere: SQL | undefined = undefined;
        if (customFieldFilterItems.length > 0) {
          customFieldWhere =
            await this.customFieldQueryService.translateFilters(
              orgContactsTable,
              organizationId,
              'org_contacts',
              customFieldFilterItems,
            );
        }

        // Combine conditions
        const baseConditions = [
          isNull(orgContactsTable.deletedAt),
          eq(orgContactsTable.organizationId, organizationId),
          query.name
            ? ilike(orgContactsTable.name, `%${query.name}%`)
            : undefined,
        ];

        const where = and(
          ...baseConditions,
          ...[regularWhere, customFieldWhere].filter(Boolean),
        );

        // Build orderBy with custom field support
        const offset = (query.page - 1) * query.perPage;
        const orderBy =
          query.sort.length > 0
            ? query.sort.map((item) => {
                if (isCustomFieldId(item.id)) {
                  const key = getCustomFieldKey(item.id);
                  return this.customFieldQueryService.buildSortCondition(
                    orgContactsTable,
                    key,
                    item.desc ? 'desc' : 'asc',
                  );
                }

                return item.desc
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    desc(orgContactsTable[item.id])
                  : // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    asc(orgContactsTable[item.id]);
              })
            : [asc(orgContactsTable.createdAt)];

        // Fetch data
        const data = await this.db
          .select()
          .from(orgContactsTable)
          .where(where)
          .limit(query.perPage)
          .offset(offset)
          .orderBy(...orderBy);

        // Fetch total count
        const totalResult = await this.db
          .select({ count: count() })
          .from(orgContactsTable)
          .where(where)
          .execute();

        const total = totalResult[0]?.count ?? 0;
        const pageCount = Math.ceil(total / query.perPage);

        return { data, pageCount };
      },
    });
  }

  async getRecordById(
    id: string,
    organizationId: string,
  ): Promise<OrgContact | undefined> {
    return this.cacheService.wrapCache<OrgContact | undefined>({
      key: Keys.Contact.idByOrg(id, organizationId),
      fn: async () =>
        await this.db.query.orgContactsTable.findFirst({
          where: and(
            eq(orgContactsTable.id, id),
            eq(orgContactsTable.organizationId, organizationId),
          ),
        }),
    });
  }

  async updateRecordById(
    id: string,
    organizationId: string,
    record: Partial<NewOrgContact>,
  ): Promise<OrgContact[]> {
    // Validate custom fields before updating
    if (record.customFields && Object.keys(record.customFields).length > 0) {
      const validation = await this.customFieldValidation.validateCustomFields(
        organizationId,
        'org_contacts',
        record.customFields,
      );

      if (!validation.success) {
        throw new BadRequestException({
          message: 'Custom field validation failed',
          errors: validation.errors,
        });
      }

      // Use normalized values
      record.customFields = validation.normalized;
    }

    return await this.db
      .update(orgContactsTable)
      .set(record)
      .where(
        and(
          eq(orgContactsTable.id, id),
          eq(orgContactsTable.organizationId, organizationId),
        ),
      )
      .returning();
  }

  /**
   * Map filter operators from frontend to CustomFieldQueryService format
   */
  private mapFilterOperator(operator: string): CustomFieldFilterOperator {
    const operatorMap: Record<string, CustomFieldFilterOperator> = {
      iLike: 'contains',
      eq: 'eq',
      ne: 'neq',
      inArray: 'in',
      notInArray: 'not_in',
      lt: 'lt',
      lte: 'lte',
      gt: 'gt',
      gte: 'gte',
      isEmpty: 'exists',
      isNotEmpty: 'exists',
      arrayIncludesAny: 'array_contains',
    };
    return operatorMap[operator] ?? 'eq';
  }
}
