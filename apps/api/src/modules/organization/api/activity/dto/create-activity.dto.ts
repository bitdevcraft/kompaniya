import { type NewOrgActivity } from '@repo/database/schema';

export type CreateActivityDto = Omit<NewOrgActivity, 'organizationId'>;
