import { dataTableConfig } from '@repo/shared/config';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import type { FilterItemType } from '~/lib/pagination/pagination-query-parser';

const normalizeArray = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string');
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [];
};

const normalizeUpper = (value: unknown) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const normalizeLower = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase() : value;

const isFilterItem = (value: unknown): value is FilterItemType => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;

  if (typeof item.id !== 'string' || typeof item.filterId !== 'string') {
    return false;
  }

  if (
    typeof item.operator !== 'string' ||
    !dataTableConfig.operators.includes(
      item.operator as (typeof dataTableConfig.operators)[number],
    )
  ) {
    return false;
  }

  if (
    typeof item.variant !== 'string' ||
    !dataTableConfig.filterVariants.includes(
      item.variant as (typeof dataTableConfig.filterVariants)[number],
    )
  ) {
    return false;
  }

  if (
    typeof item.value !== 'string' &&
    !(
      Array.isArray(item.value) &&
      item.value.every((entry) => typeof entry === 'string')
    )
  ) {
    return false;
  }

  return true;
};

const normalizeFilters = (value: unknown): FilterItemType[] => {
  if (value === undefined || value === null) return [];

  const parsed =
    typeof value === 'string'
      ? (() => {
          const trimmed = value.trim();
          if (!trimmed) return [];
          try {
            return JSON.parse(trimmed) as unknown;
          } catch {
            return [];
          }
        })()
      : value;

  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isFilterItem);
};

export class PreviewRecipientsDto {
  @Transform(({ value }) => normalizeFilters(value))
  @IsArray()
  @IsOptional()
  filters?: FilterItemType[];

  @Transform(({ value }) => normalizeLower(value))
  @IsEnum(['and', 'or'])
  @IsOptional()
  joinOperator?: 'and' | 'or';

  @Transform(({ value }) => normalizeUpper(value))
  @IsEnum(['ALL', 'ANY'])
  @IsOptional()
  tagMatchType?: 'ALL' | 'ANY';

  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  targetCategories?: string[];

  @Transform(({ value }) => normalizeArray(value))
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  targetTags?: string[];
}
