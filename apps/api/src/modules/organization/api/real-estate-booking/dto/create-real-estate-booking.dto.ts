import { type NewOrgRealEstateBooking } from '@repo/database/schema';

export type CreateRealEstateBookingDto = Omit<
  NewOrgRealEstateBooking,
  'organizationId'
>;
