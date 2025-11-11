import { type NewOrgEmailDomain } from '@repo/database/schema';

export type UpdateDomainDto = Partial<
  Omit<NewOrgEmailDomain, 'id' | 'organizationId' | 'public' | 'secret'>
>;
