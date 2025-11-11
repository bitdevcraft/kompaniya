import { type NewOrgEmailTestReceiver } from '@repo/database/schema';

export type CreateEmailTestReceiverDto = Omit<
  NewOrgEmailTestReceiver,
  'organizationId'
>;
