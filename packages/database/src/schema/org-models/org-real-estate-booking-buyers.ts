import { boolean, pgTable, unique, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgContactsTable } from "./org-contacts";
import { orgRealEstateBookingsTable } from "./org-real-estate-bookings";

export const orgRealEstateBookingBuyersTable = pgTable(
  "org_real_estate_booking_buyers",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,

    bookingId: uuid("bookingId").references(
      () => orgRealEstateBookingsTable.id,
      { onDelete: "cascade" },
    ),
    contactId: uuid("contactId").references(() => orgContactsTable.id, {
      onDelete: "cascade",
    }),
    isPrimaryBuyer: boolean("is_primary_buyer").default(false),
  },
  (t) => [unique("buyers").on(t.bookingId, t.contactId)],
);

export type NewOrgRealEstateBookingBuyer =
  typeof orgRealEstateBookingBuyersTable.$inferInsert;
export type OrgRealEstateBookingBuyer =
  typeof orgRealEstateBookingBuyersTable.$inferSelect;
