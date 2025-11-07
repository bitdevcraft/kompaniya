import { pgTable, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgRealEstateProjectsTable = pgTable("org_real_estate_projects", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: varchar("name", { length: 255 }),
});

export type NewOrgRealEstateProject =
  typeof orgRealEstateProjectsTable.$inferInsert;
export type OrgRealEstateProject =
  typeof orgRealEstateProjectsTable.$inferSelect;
