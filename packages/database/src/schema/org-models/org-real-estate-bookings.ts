import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgRealEstateProjectsTable } from "./org-real-estate-projects";
import { orgRealEstatePropertiesTable } from "./org-real-estate-properties";

export const orgRealEstateBookingsTable = pgTable("org_real_estate_bookings", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: varchar("name", { length: 255 }),
  projectId: uuid("project_id").references(
    () => orgRealEstateProjectsTable.id,
    { onDelete: "restrict" },
  ),
  propertyId: uuid("property_id").references(
    () => orgRealEstatePropertiesTable.id,
    { onDelete: "restrict" },
  ),
});

export type NewOrgRealEstateBooking =
  typeof orgRealEstateBookingsTable.$inferInsert;
export type OrgRealEstateBooking =
  typeof orgRealEstateBookingsTable.$inferSelect;
