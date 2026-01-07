import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  type CustomFieldDefinition,
  customFieldDefinitionsTable,
} from '@repo/database/schema';
import { sql, type SQL, type Table } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

export interface CustomFieldFilter {
  key: string;
  operator:
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
  value: unknown;
}

/**
 * Service for translating custom field filters to SQL conditions
 */
@Injectable()
export class CustomFieldQueryService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  /**
   * Build SQL condition for a single custom field filter
   */
  buildFilterCondition(
    table: Table,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    definition: CustomFieldDefinition,
    filter: CustomFieldFilter,
  ): SQL | undefined {
    // Access the custom_fields column from the table
    const customFieldsColumn = (table as unknown as Record<string, unknown>)
      .custom_fields;

    if (!customFieldsColumn) {
      return undefined;
    }

    const keyPath = sql`${customFieldsColumn}->>${sql.raw(`'${filter.key}'`)}`;

    switch (filter.operator) {
      case 'exists':
        return sql`${customFieldsColumn} ? ${sql.raw(`'${filter.key}'`)}`;

      case 'eq':
        return sql`${keyPath} = ${filter.value}`;

      case 'neq':
        return sql`${keyPath} != ${filter.value}`;

      case 'in':
        if (!Array.isArray(filter.value)) return undefined;
        if (filter.value.length === 0) return sql`FALSE`;
        return sql`${keyPath} = ANY(${sql.raw(`ARRAY[${filter.value.map((v) => `'${v}'`).join(', ')}]`)})`;

      case 'not_in':
        if (!Array.isArray(filter.value)) return undefined;
        if (filter.value.length === 0) return sql`TRUE`;
        return sql`${keyPath} != ALL(${sql.raw(`ARRAY[${filter.value.map((v) => `'${v}'`).join(', ')}]`)})`;

      case 'contains': {
        // cspell:disable-next-line
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const valuePattern = `%${filter.value}%`;
        const pattern = `'${valuePattern}'`;
        return sql`${keyPath} ILIKE ${sql.raw(pattern)}`;
      }

      case 'gt':
        return sql`CAST(${keyPath} AS NUMERIC) > ${filter.value}`;

      case 'gte':
        return sql`CAST(${keyPath} AS NUMERIC) >= ${filter.value}`;

      case 'lt':
        return sql`CAST(${keyPath} AS NUMERIC) < ${filter.value}`;

      case 'lte':
        return sql`CAST(${keyPath} AS NUMERIC) <= ${filter.value}`;

      case 'array_contains': {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const valueStr = `${filter.value}`;
        return sql`${customFieldsColumn}->${sql.raw(`'${filter.key}'`)} ? ${sql.raw(`'${valueStr}'`)}`;
      }

      default:
        return undefined;
    }
  }

  /**
   * Build sort condition for custom field
   */
  buildSortCondition(
    table: Table,
    key: string,
    order: 'asc' | 'desc' = 'asc',
  ): SQL {
    const customFieldsColumn = (table as unknown as Record<string, unknown>)
      .custom_fields;

    if (!customFieldsColumn) {
      return sql`TRUE`;
    }

    const keyPath = sql`${customFieldsColumn}->>${sql.raw(`'${key}'`)}`;

    return order === 'asc' ? sql`${keyPath} ASC` : sql`${keyPath} DESC`;
  }

  /**
   * Get field definition by key
   */
  async getFieldDefinition(
    organizationId: string,
    entityType: string,
    key: string,
  ): Promise<CustomFieldDefinition | undefined> {
    const results = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.entityType, entityType),
          eq(customFieldDefinitionsTable.key, key),
          eq(customFieldDefinitionsTable.isDeleted, false),
        ),
      )
      .limit(1);

    return results[0];
  }

  /**
   * Translate custom field filters to SQL conditions
   */
  async translateFilters(
    table: Table,
    organizationId: string,
    entityType: string,
    filters: CustomFieldFilter[],
  ): Promise<SQL | undefined> {
    if (filters.length === 0) return undefined;

    const conditions: SQL[] = [];

    for (const filter of filters) {
      const definition = await this.getFieldDefinition(
        organizationId,
        entityType,
        filter.key,
      );

      if (!definition) continue;

      const condition = this.buildFilterCondition(table, definition, filter);

      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
