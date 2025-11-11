import { type NewOrgOpportunity } from '@repo/database/schema';

export type CreateOpportunityDto = Omit<NewOrgOpportunity, 'organizationId'>;
