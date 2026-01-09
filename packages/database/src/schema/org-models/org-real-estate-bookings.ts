import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgRealEstateProjectsTable } from "./org-real-estate-projects";
import { orgRealEstatePropertiesTable } from "./org-real-estate-properties";

export const orgRealEstateBookingTypeEnum = pgEnum(
  "org_real_estate_booking_type",
  ["sale", "rent"],
);

export const orgRealEstateBookingStatusEnum = pgEnum(
  "org_real_estate_booking_status",
  ["pending", "confirmed", "cancelled", "completed"],
);

export const orgRealEstateBookingsTable = pgTable("org_real_estate_bookings", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  referenceCode: varchar("reference_code", { length: 100 }),
  projectId: uuid("project_id").references(
    () => orgRealEstateProjectsTable.id,
    { onDelete: "restrict" },
  ),
  propertyId: uuid("property_id").references(
    () => orgRealEstatePropertiesTable.id,
    { onDelete: "restrict" },
  ),
  bookingType: orgRealEstateBookingTypeEnum("booking_type"),
  status: orgRealEstateBookingStatusEnum("status").default("pending"),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  depositAmount: numeric("deposit_amount", { precision: 14, scale: 2 }),
  expectedCompletionAt: timestamp("expected_completion_at", {
    withTimezone: true,
  }),
  contractSignedAt: timestamp("contract_signed_at", { withTimezone: true }),
  notes: text("notes"),
});

export type NewOrgRealEstateBooking =
  typeof orgRealEstateBookingsTable.$inferInsert;
export type OrgRealEstateBooking =
  typeof orgRealEstateBookingsTable.$inferSelect;
