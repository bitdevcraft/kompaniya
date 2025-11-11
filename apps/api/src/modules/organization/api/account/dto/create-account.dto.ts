import { type NewOrgAccount } from '@repo/database/schema';

export type CreateAccountDto = Omit<NewOrgAccount, 'organizationId'>;
