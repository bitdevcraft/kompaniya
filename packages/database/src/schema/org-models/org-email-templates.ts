import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEmailTemplatesTable = pgTable("org_email_templates", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: text("name").notNull(),
  jsonSchema: jsonb("json_schema").$type<Record<string, unknown>>().notNull(),
  mjml: text("mjml").notNull(),
  html: text("html").notNull(),
  version: integer("version").notNull().default(1),
});

export type NewOrgEmailTemplate = typeof orgEmailTemplatesTable.$inferInsert;
export type OrgEmailTemplate = typeof orgEmailTemplatesTable.$inferSelect;
