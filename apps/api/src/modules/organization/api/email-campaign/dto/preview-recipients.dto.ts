import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

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

export class PreviewRecipientsDto {
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
