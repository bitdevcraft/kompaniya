import { pgTable, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgActivitiesTable = pgTable("org_activities", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: varchar("name", { length: 1024 }),
});

export type NewOrgActivity = typeof orgActivitiesTable.$inferInsert;
export type OrgActivity = typeof orgActivitiesTable.$inferSelect;
