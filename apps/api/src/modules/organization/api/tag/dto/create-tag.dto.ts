import { type NewOrgTag } from '@repo/database/schema';

export type CreateTagDto = Omit<NewOrgTag, 'organizationId'>;
