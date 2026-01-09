import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailDomainsTable } from "./org-email-domains";
import { mjmlEditorField, orgEmailTemplatesTable } from "./org-email-templates";
import { orgEmailTestReceiversTable } from "./org-email-test-receivers";

export const orgEmailCampaignsTable = pgTable("org_email_campaigns", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  subject: varchar("subject", { length: 998 }),
  body: text("body"),

  ...mjmlEditorField,

  orgEmailDomainId: uuid("org_email_domain_id").references(
    () => orgEmailDomainsTable.id,
    {
      onDelete: "set null",
    },
  ),
  orgEmailTemplateId: uuid("org_email_template_id").references(
    () => orgEmailTemplatesTable.id,
    {
      onDelete: "restrict",
    },
  ),
  orgEmailTestReceiverId: uuid("org_email_test_receiver_id").references(
    () => orgEmailTestReceiversTable.id,
    { onDelete: "set null" },
  ),
  targetCategories: text("target_categories").array(),

  status: varchar("status", { length: 50 }),
});

export type NewOrgEmailCampaign = typeof orgEmailCampaignsTable.$inferInsert;
export type OrgEmailCampaign = typeof orgEmailCampaignsTable.$inferSelect;
