import { DataTableConfig } from '@repo/shared/config';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import {
  and,
  type AnyColumn,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  not,
  notIlike,
  notInArray,
  or,
  type SQL,
  sql,
  type Table,
} from 'drizzle-orm';

import { FilterItemType } from './pagination-query-parser';

export interface ExtendedColumnFilter<TData> extends FilterItemType {
  id: Extract<keyof TData, string>;
}

export type JoinOperator = DataTableConfig['joinOperators'][number];

export function filterColumns<T extends Table>({
  table,
  filters,
  joinOperator,
}: {
  table: T;
  filters: ExtendedColumnFilter<T>[];
  joinOperator: JoinOperator;
}): SQL | undefined {
  const joinFn = joinOperator === 'and' ? and : or;

  const conditions = filters.map((filter) => {
    // Skip custom field filters - they should be handled separately
    // by the service layer using CustomFieldQueryService
    if (isCustomFieldId(filter.id)) {
      return undefined;
    }

    const column = getColumn(table, filter.id);

    switch (filter.operator) {
      case 'iLike':
        return filter.variant === 'text' && typeof filter.value === 'string'
          ? or(
              ilike(column, `%${filter.value}%`),
              ilike(column, `${filter.value}%`),
              ilike(column, `%${filter.value}`),
            )
          : undefined;

      case 'notILike':
        return filter.variant === 'text' && typeof filter.value === 'string'
          ? notIlike(column, `%${filter.value}%`)
          : undefined;

      case 'eq':
        if (column.dataType === 'boolean' && typeof filter.value === 'string') {
          return eq(column, filter.value === 'true');
        }
        if (filter.variant === 'date' || filter.variant === 'dateRange') {
          const date = new Date(Number(filter.value));
          date.setHours(0, 0, 0, 0);
          const end = new Date(date);
          end.setHours(23, 59, 59, 999);
          return and(gte(column, date), lte(column, end));
        }
        return eq(column, filter.value);

      case 'ne':
        if (column.dataType === 'boolean' && typeof filter.value === 'string') {
          return ne(column, filter.value === 'true');
        }
        if (filter.variant === 'date' || filter.variant === 'dateRange') {
          const date = new Date(Number(filter.value));
          date.setHours(0, 0, 0, 0);
          const end = new Date(date);
          end.setHours(23, 59, 59, 999);
          return or(lt(column, date), gt(column, end));
        }
        return ne(column, filter.value);

      case 'inArray':
        if (Array.isArray(filter.value)) {
          return inArray(column, filter.value);
        }
        return undefined;

      case 'notInArray':
        if (Array.isArray(filter.value)) {
          return notInArray(column, filter.value);
        }
        return undefined;

      case 'lt':
        return filter.variant === 'number' || filter.variant === 'range'
          ? lt(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? lt(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(23, 59, 59, 999);
                  return date;
                })(),
              )
            : undefined;

      case 'lte':
        return filter.variant === 'number' || filter.variant === 'range'
          ? lte(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? lte(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(23, 59, 59, 999);
                  return date;
                })(),
              )
            : undefined;

      case 'gt':
        return filter.variant === 'number' || filter.variant === 'range'
          ? gt(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? gt(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(0, 0, 0, 0);
                  return date;
                })(),
              )
            : undefined;

      case 'gte':
        return filter.variant === 'number' || filter.variant === 'range'
          ? gte(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? gte(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(0, 0, 0, 0);
                  return date;
                })(),
              )
            : undefined;

      case 'isBetween':
        if (
          (filter.variant === 'date' || filter.variant === 'dateRange') &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          return and(
            filter.value[0]
              ? gte(
                  column,
                  (() => {
                    const date = new Date(Number(filter.value[0]));
                    date.setHours(0, 0, 0, 0);
                    return date;
                  })(),
                )
              : undefined,
            filter.value[1]
              ? lte(
                  column,
                  (() => {
                    const date = new Date(Number(filter.value[1]));
                    date.setHours(23, 59, 59, 999);
                    return date;
                  })(),
                )
              : undefined,
          );
        }

        if (
          (filter.variant === 'number' || filter.variant === 'range') &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          const firstValue =
            filter.value[0] && filter.value[0].trim() !== ''
              ? Number(filter.value[0])
              : null;
          const secondValue =
            filter.value[1] && filter.value[1].trim() !== ''
              ? Number(filter.value[1])
              : null;

          if (firstValue === null && secondValue === null) {
            return undefined;
          }

          if (firstValue !== null && secondValue === null) {
            return eq(column, firstValue);
          }

          if (firstValue === null && secondValue !== null) {
            return eq(column, secondValue);
          }

          return and(
            firstValue !== null ? gte(column, firstValue) : undefined,
            secondValue !== null ? lte(column, secondValue) : undefined,
          );
        }
        return undefined;

      case 'isRelativeToToday':
        if (
          (filter.variant === 'date' || filter.variant === 'dateRange') &&
          typeof filter.value === 'string'
        ) {
          const today = new Date();
          const [amount, unit] = filter.value.split(' ') ?? [];
          let startDate: Date;
          let endDate: Date;

          if (!amount || !unit) return undefined;

          switch (unit) {
            case 'days':
              startDate = startOfDay(addDays(today, Number.parseInt(amount)));
              endDate = endOfDay(startDate);
              break;
            case 'weeks':
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 7),
              );
              endDate = endOfDay(addDays(startDate, 6));
              break;
            case 'months':
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 30),
              );
              endDate = endOfDay(addDays(startDate, 29));
              break;
            default:
              return undefined;
          }

          return and(gte(column, startDate), lte(column, endDate));
        }
        return undefined;

      case 'isEmpty':
        return isEmpty(column);

      case 'isNotEmpty':
        return not(isEmpty(column));

      case 'arrayIncludesAny':
        if (Array.isArray(filter.value)) {
          const columnSql = column as unknown as string;

          return sql`${columnSql} ?| ARRAY[${sql.join(
            filter.value.map((v) => sql`${v}`),
            sql`, `,
          )}]`;
        }
        return undefined;

      case 'arrayIncludesAll':
        if (Array.isArray(filter.value)) {
          const columnSql = column as unknown as string;

          return sql`${columnSql} ?& ARRAY[${sql.join(
            filter.value.map((v) => sql`${v}`),
            sql`, `,
          )}]`;
        }
        return undefined;

      case 'arrayIncludesNone':
        if (Array.isArray(filter.value)) {
          const columnSql = column as unknown as string;

          return sql`NOT (${columnSql} ?| ARRAY[${sql.join(
            filter.value.map((v) => sql`${v}`),
            sql`, `,
          )}])`;
        }
        return undefined;

      case 'arrayIsEmpty':
        return sql`jsonb_array_length(${column}) = 0`;

      case 'arrayIsNotEmpty':
        return sql`jsonb_array_length(${column}) > 0`;

      default:
        throw new Error(`Unsupported operator: ${filter.operator as string}`);
    }
  });

  const validConditions = conditions.filter(
    (condition) => condition !== undefined,
  );

  return validConditions.length > 0 ? joinFn(...validConditions) : undefined;
}

export function filterQueries<T extends Table>({
  table,
  filters,
}: {
  table: T;
  filters: ExtendedColumnFilter<T>[];
}): SQL[] | undefined {
  const conditions = filters.map((filter) => {
    // Skip custom field filters - they should be handled separately
    if (isCustomFieldId(filter.id)) {
      return undefined;
    }

    const column = getColumn(table, filter.id);

    switch (filter.operator) {
      case 'iLike':
        return filter.variant === 'text' && typeof filter.value === 'string'
          ? ilike(column, `%${filter.value}%`)
          : undefined;

      case 'notILike':
        return filter.variant === 'text' && typeof filter.value === 'string'
          ? notIlike(column, `%${filter.value}%`)
          : undefined;

      case 'eq':
        if (column.dataType === 'boolean' && typeof filter.value === 'string') {
          return eq(column, filter.value === 'true');
        }
        if (filter.variant === 'date' || filter.variant === 'dateRange') {
          const date = new Date(Number(filter.value));
          date.setHours(0, 0, 0, 0);
          const end = new Date(date);
          end.setHours(23, 59, 59, 999);
          return and(gte(column, date), lte(column, end));
        }
        return eq(column, filter.value);

      case 'ne':
        if (column.dataType === 'boolean' && typeof filter.value === 'string') {
          return ne(column, filter.value === 'true');
        }
        if (filter.variant === 'date' || filter.variant === 'dateRange') {
          const date = new Date(Number(filter.value));
          date.setHours(0, 0, 0, 0);
          const end = new Date(date);
          end.setHours(23, 59, 59, 999);
          return or(lt(column, date), gt(column, end));
        }
        return ne(column, filter.value);

      case 'inArray':
        if (Array.isArray(filter.value)) {
          return inArray(column, filter.value);
        }
        return undefined;

      case 'notInArray':
        if (Array.isArray(filter.value)) {
          return notInArray(column, filter.value);
        }
        return undefined;

      case 'lt':
        return filter.variant === 'number' || filter.variant === 'range'
          ? lt(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? lt(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(23, 59, 59, 999);
                  return date;
                })(),
              )
            : undefined;

      case 'lte':
        return filter.variant === 'number' || filter.variant === 'range'
          ? lte(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? lte(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(23, 59, 59, 999);
                  return date;
                })(),
              )
            : undefined;

      case 'gt':
        return filter.variant === 'number' || filter.variant === 'range'
          ? gt(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? gt(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(0, 0, 0, 0);
                  return date;
                })(),
              )
            : undefined;

      case 'gte':
        return filter.variant === 'number' || filter.variant === 'range'
          ? gte(column, filter.value)
          : filter.variant === 'date' && typeof filter.value === 'string'
            ? gte(
                column,
                (() => {
                  const date = new Date(Number(filter.value));
                  date.setHours(0, 0, 0, 0);
                  return date;
                })(),
              )
            : undefined;

      case 'isBetween':
        if (
          (filter.variant === 'date' || filter.variant === 'dateRange') &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          return and(
            filter.value[0]
              ? gte(
                  column,
                  (() => {
                    const date = new Date(Number(filter.value[0]));
                    date.setHours(0, 0, 0, 0);
                    return date;
                  })(),
                )
              : undefined,
            filter.value[1]
              ? lte(
                  column,
                  (() => {
                    const date = new Date(Number(filter.value[1]));
                    date.setHours(23, 59, 59, 999);
                    return date;
                  })(),
                )
              : undefined,
          );
        }

        if (
          (filter.variant === 'number' || filter.variant === 'range') &&
          Array.isArray(filter.value) &&
          filter.value.length === 2
        ) {
          const firstValue =
            filter.value[0] && filter.value[0].trim() !== ''
              ? Number(filter.value[0])
              : null;
          const secondValue =
            filter.value[1] && filter.value[1].trim() !== ''
              ? Number(filter.value[1])
              : null;

          if (firstValue === null && secondValue === null) {
            return undefined;
          }

          if (firstValue !== null && secondValue === null) {
            return eq(column, firstValue);
          }

          if (firstValue === null && secondValue !== null) {
            return eq(column, secondValue);
          }

          return and(
            firstValue !== null ? gte(column, firstValue) : undefined,
            secondValue !== null ? lte(column, secondValue) : undefined,
          );
        }
        return undefined;

      case 'isRelativeToToday':
        if (
          (filter.variant === 'date' || filter.variant === 'dateRange') &&
          typeof filter.value === 'string'
        ) {
          const today = new Date();
          const [amount, unit] = filter.value.split(' ') ?? [];
          let startDate: Date;
          let endDate: Date;

          if (!amount || !unit) return undefined;

          switch (unit) {
            case 'days':
              startDate = startOfDay(addDays(today, Number.parseInt(amount)));
              endDate = endOfDay(startDate);
              break;
            case 'weeks':
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 7),
              );
              endDate = endOfDay(addDays(startDate, 6));
              break;
            case 'months':
              startDate = startOfDay(
                addDays(today, Number.parseInt(amount) * 30),
              );
              endDate = endOfDay(addDays(startDate, 29));
              break;
            default:
              return undefined;
          }

          return and(gte(column, startDate), lte(column, endDate));
        }
        return undefined;

      case 'isEmpty':
        return isEmpty(column);

      case 'isNotEmpty':
        return not(isEmpty(column));

      case 'arrayIncludesAny':
        if (Array.isArray(filter.value)) {
          const columnSql = column as unknown as string;

          return sql`${columnSql} ?| ARRAY[${sql.join(
            filter.value.map((v) => sql`${v}`),
            sql`, `,
          )}]`;
        }
        return undefined;

      case 'arrayIncludesAll':
        if (Array.isArray(filter.value)) {
          const columnSql = column as unknown as string;

          return sql`${columnSql} ?& ARRAY[${sql.join(
            filter.value.map((v) => sql`${v}`),
            sql`, `,
          )}]`;
        }
        return undefined;

      case 'arrayIncludesNone':
        if (Array.isArray(filter.value)) {
          const columnSql = column as unknown as string;

          return sql`NOT (${columnSql} ?| ARRAY[${sql.join(
            filter.value.map((v) => sql`${v}`),
            sql`, `,
          )}])`;
        }
        return undefined;

      case 'arrayIsEmpty':
        return sql`jsonb_array_length(${column}) = 0`;

      case 'arrayIsNotEmpty':
        return sql`jsonb_array_length(${column}) > 0`;

      default:
        throw new Error(`Unsupported operator: ${filter.operator as string}`);
    }
  });

  const validConditions = conditions.filter(
    (condition) => condition !== undefined,
  );

  return validConditions;
}

export function getColumn<T extends Table>(
  table: T,
  columnKey: keyof T,
): AnyColumn {
  return table[columnKey] as AnyColumn;
}

/**
 * Extract the custom field key from a filter ID
 * @example getCustomFieldKey('customFields.employeeId') => 'employeeId'
 */
export function getCustomFieldKey(id: string): string {
  return id.replace('customFields.', '');
}

/**
 * Check if a filter ID is a custom field (format: customFields.fieldName)
 */
export function isCustomFieldId(id: string): boolean {
  return id.startsWith('customFields.');
}

export function isEmpty(column: AnyColumn) {
  return sql<boolean>`
    case
      when ${column} is null then true
      when ${column} = '' then true
      when ${column}::text = '[]' then true
      when ${column}::text = '{}' then true
      else false
    end
  `;
}

/**
 * Separate filters into regular column filters and custom field filters
 */
export function separateFilters<TData>(
  filters: ExtendedColumnFilter<TData>[],
): {
  regularFilters: ExtendedColumnFilter<TData>[];
  customFieldFilters: ExtendedColumnFilter<TData>[];
} {
  const regularFilters: ExtendedColumnFilter<TData>[] = [];
  const customFieldFilters: ExtendedColumnFilter<TData>[] = [];

  for (const filter of filters) {
    if (isCustomFieldId(filter.id)) {
      customFieldFilters.push(filter);
    } else {
      regularFilters.push(filter);
    }
  }

  return { regularFilters, customFieldFilters };
}
