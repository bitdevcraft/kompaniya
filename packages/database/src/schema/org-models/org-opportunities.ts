import { pgTable } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgOpportunitiesTable = pgTable("org_opportunities", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
});

export type NewOrgOpportunity = typeof orgOpportunitiesTable.$inferInsert;
export type OrgOpportunity = typeof orgOpportunitiesTable.$inferSelect;
