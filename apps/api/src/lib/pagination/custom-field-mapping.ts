import type { CustomFieldDefinition } from '@repo/database/schema';

import type { CustomFieldFilter } from '~/modules/core/custom-fields/custom-field-query.service';

/**
 * Filter operators from frontend
 */
export type FilterOperator =
  | 'iLike'
  | 'notILike'
  | 'eq'
  | 'ne'
  | 'inArray'
  | 'notInArray'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'isBetween'
  | 'isRelativeToToday'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'arrayIncludesAny'
  | 'arrayIncludesAll'
  | 'arrayIncludesNone'
  | 'arrayIsEmpty'
  | 'arrayIsNotEmpty';

/**
 * Get available filter operators for a custom field type
 */
export function getCustomFieldOperators(
  fieldType: CustomFieldDefinition['fieldType'],
): FilterOperator[] {
  const operators: Record<
    CustomFieldDefinition['fieldType'],
    FilterOperator[]
  > = {
    string: ['iLike', 'eq', 'ne', 'isEmpty', 'isNotEmpty'],
    number: [
      'eq',
      'ne',
      'lt',
      'lte',
      'gt',
      'gte',
      'isBetween',
      'isEmpty',
      'isNotEmpty',
    ],
    boolean: ['eq', 'ne'],
    date: [
      'eq',
      'ne',
      'lt',
      'lte',
      'gt',
      'gte',
      'isBetween',
      'isEmpty',
      'isNotEmpty',
    ],
    datetime: [
      'eq',
      'ne',
      'lt',
      'lte',
      'gt',
      'gte',
      'isBetween',
      'isEmpty',
      'isNotEmpty',
    ],
    single_select: ['eq', 'ne', 'isEmpty', 'isNotEmpty'],
    multi_select: [
      'arrayIncludesAny',
      'arrayIncludesAll',
      'arrayIncludesNone',
      'arrayIsEmpty',
      'arrayIsNotEmpty',
    ],
    json: ['iLike', 'eq', 'ne', 'isEmpty', 'isNotEmpty'],
    reference: ['eq', 'ne', 'isEmpty', 'isNotEmpty'],
  };
  return operators[fieldType];
}

/**
 * Check if a value represents a "false" condition for isEmpty check
 */
export function isFalseForIsEmpty(operator: FilterOperator): boolean {
  return (
    operator === 'isNotEmpty' ||
    operator === 'arrayIsEmpty' ||
    operator === 'arrayIsNotEmpty'
  );
}

/**
 * Map custom field type to filter variant
 */
export function mapCustomFieldTypeToVariant(
  fieldType: CustomFieldDefinition['fieldType'],
): string {
  const mapping: Record<CustomFieldDefinition['fieldType'], string> = {
    string: 'text',
    number: 'number',
    boolean: 'boolean',
    date: 'date',
    datetime: 'dateRange',
    single_select: 'select',
    multi_select: 'multiSelectArray',
    json: 'text',
    reference: 'text',
  };
  return mapping[fieldType];
}

/**
 * Map frontend filter operator to custom field query operator
 */
export function mapToCustomFieldOperator(
  operator: FilterOperator,
): CustomFieldFilter['operator'] {
  const operatorMap: Record<FilterOperator, CustomFieldFilter['operator']> = {
    iLike: 'contains',
    notILike: 'neq',
    eq: 'eq',
    ne: 'neq',
    inArray: 'in',
    notInArray: 'not_in',
    lt: 'lt',
    lte: 'lte',
    gt: 'gt',
    gte: 'gte',
    isBetween: 'eq',
    isRelativeToToday: 'eq',
    isEmpty: 'exists',
    isNotEmpty: 'exists',
    arrayIncludesAny: 'array_contains',
    arrayIncludesAll: 'array_contains_all',
    arrayIncludesNone: 'neq',
    arrayIsEmpty: 'exists',
    arrayIsNotEmpty: 'exists',
  };
  return operatorMap[operator] ?? 'eq';
}
