import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgContactsTable } from "./org-contacts";
import { orgEmailCampaignsTable } from "./org-email-campaigns";
import { orgEmailDomainsTable } from "./org-email-domains";

export const orgEmailsTable = pgTable("org_emails", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  messageId: text("message_id").unique(),
  subject: varchar("subject", { length: 998 }),
  body: text("body"),
  rawMessage: text("raw_message"),
  status: text("status", {
    enum: ["SENT", "DELIVERED", "BOUNCED", "OPENED", "COMPLAINT"],
  }),
  emailCampaignId: uuid("email_campaign_id").references(
    () => orgEmailCampaignsTable.id,
    {
      onDelete: "set null",
    },
  ),
  emailDomainId: uuid("email_domain_id").references(
    () => orgEmailDomainsTable.id,
    { onDelete: "cascade" },
  ),
  crmContactId: uuid("crm_contact_id").references(() => orgContactsTable.id, {
    onDelete: "set null",
  }),
});

export type NewOrgEmail = typeof orgEmailsTable.$inferInsert;
export type OrgEmail = typeof orgEmailsTable.$inferSelect;
