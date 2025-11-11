import { type NewOrgRealEstateProperty } from '@repo/database/schema';

export type CreateRealEstatePropertyDto = Omit<
  NewOrgRealEstateProperty,
  'organizationId'
>;
