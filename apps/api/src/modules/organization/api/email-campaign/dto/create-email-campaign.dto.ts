import { type NewOrgEmailCampaign } from '@repo/database/schema';

export type CreateEmailCampaignDto = Omit<
  NewOrgEmailCampaign,
  'organizationId'
>;
