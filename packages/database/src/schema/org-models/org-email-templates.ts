import { pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEmailTemplatesTable = pgTable("org_email_templates", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  name: varchar("name", { length: 255 }),
  subject: varchar("subject", { length: 998 }),
  body: text("body"),
});

export type NewOrgEmailTemplate = typeof orgEmailTemplatesTable.$inferInsert;
export type OrgEmailTemplate = typeof orgEmailTemplatesTable.$inferSelect;
