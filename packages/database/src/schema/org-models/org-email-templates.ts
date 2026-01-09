import { pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const mjmlEditorField = {
  mjmlContent: text("mjml_content"),
  mjmlJsonContent: text("mjml_json_content"),
  htmlContent: text("html_content"),
};

export const orgEmailTemplatesTable = pgTable("org_email_templates", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  subject: varchar("subject", { length: 998 }),
  body: text("body"),

  ...mjmlEditorField,
});

export type NewOrgEmailTemplate = typeof orgEmailTemplatesTable.$inferInsert;
export type OrgEmailTemplate = typeof orgEmailTemplatesTable.$inferSelect;
