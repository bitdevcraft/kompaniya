import { pgTable, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgRealEstateBookingsTable = pgTable("org_real_estate_bookings", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: varchar("name", { length: 255 }),
});

export type NewOrgRealEstateBooking =
  typeof orgRealEstateBookingsTable.$inferInsert;
export type OrgRealEstateBooking =
  typeof orgRealEstateBookingsTable.$inferSelect;
