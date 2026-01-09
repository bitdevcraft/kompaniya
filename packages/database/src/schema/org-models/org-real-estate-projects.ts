import { integer, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgRealEstateProjectStatusEnum = pgEnum(
  "org_real_estate_project_status",
  ["planning", "active", "completed", "on_hold", "cancelled"],
);

export const orgRealEstateProjectsTable = pgTable("org_real_estate_projects", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  description: text("description"),
  developerName: varchar("developer_name", { length: 255 }),
  status: orgRealEstateProjectStatusEnum("status").default("planning"),
  launchYear: integer("launch_year"),
  expectedCompletionYear: integer("expected_completion_year"),
  totalUnits: integer("total_units"),
  city: varchar("city", { length: 150 }),
  state: varchar("state", { length: 150 }),
  country: varchar("country", { length: 150 }),
  addressLine1: varchar("address_line_1", { length: 255 }),
  addressLine2: varchar("address_line_2", { length: 255 }),
});

export type NewOrgRealEstateProject =
  typeof orgRealEstateProjectsTable.$inferInsert;
export type OrgRealEstateProject =
  typeof orgRealEstateProjectsTable.$inferSelect;
