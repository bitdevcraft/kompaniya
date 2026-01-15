import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

const normalizeBoolean = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
};

export class CampaignRecipientsQueryDto {
  @Transform(({ value }) => normalizeBoolean(value))
  @IsOptional()
  @IsBoolean()
  isTest?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  perPage?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'QUEUED', 'SENT', 'FAILED', 'BOUNCED'])
  status?: 'PENDING' | 'QUEUED' | 'SENT' | 'FAILED' | 'BOUNCED';
}
