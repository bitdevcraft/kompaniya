import { pgTable, text } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgTagsTable = pgTable("org_tags", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: text("name"),
  relatedType: text("related_type"),
});

export type NewOrgTag = typeof orgTagsTable.$inferInsert;
export type OrgTag = typeof orgTagsTable.$inferSelect;
