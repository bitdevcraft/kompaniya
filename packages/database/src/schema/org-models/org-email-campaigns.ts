import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailDomainsTable } from "./org-email-domains";
import { orgEmailTemplatesTable } from "./org-email-templates";

export const orgEmailCampaignsTable = pgTable("org_email_campaigns", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  name: varchar("name", { length: 255 }),
  subject: varchar("subject", { length: 998 }),
  body: text("body"),
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
  targetCategories: text("target_categories").array(),

  status: varchar("status", { length: 50 }),
});

export type NewOrgEmailCampaign = typeof orgEmailCampaignsTable.$inferInsert;
export type OrgEmailCampaign = typeof orgEmailCampaignsTable.$inferSelect;
