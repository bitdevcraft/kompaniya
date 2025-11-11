import { type NewOrgContact } from '@repo/database/schema';

export type CreateContactDto = Omit<NewOrgContact, 'organizationId'>;
