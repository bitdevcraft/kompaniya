import { type NewOrgCategory } from '@repo/database/schema';

export type CreateCategoryDto = Omit<NewOrgCategory, 'organizationId'>;
