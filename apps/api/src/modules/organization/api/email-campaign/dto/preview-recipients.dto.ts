import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class PreviewRecipientsDto {
  @IsEnum(['ALL', 'ANY'])
  @IsOptional()
  tagMatchType?: 'ALL' | 'ANY';

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  targetCategories?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  targetTags?: string[];
}
