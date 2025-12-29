import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailTemplatesTable } from "./org-email-templates";

export const orgEmailAssetsTable = pgTable("org_email_assets", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  templateId: uuid("template_id")
    .references(() => orgEmailTemplatesTable.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
});

export type NewOrgEmailAsset = typeof orgEmailAssetsTable.$inferInsert;
export type OrgEmailAsset = typeof orgEmailAssetsTable.$inferSelect;
