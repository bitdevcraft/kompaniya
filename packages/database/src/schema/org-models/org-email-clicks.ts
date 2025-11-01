import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailDomainsTable } from "./org-email-domains";
import { orgEmailsTable } from "./org-emails";

export const orgEmailClicksTable = pgTable("org_email_clicks", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  link: text("link"),
  orgEmailId: uuid("org_email_id").references(() => orgEmailsTable.id, {
    onDelete: "cascade",
  }),
  orgEmailDomainId: uuid("org_email_domain_id").references(
    () => orgEmailDomainsTable.id,
    { onDelete: "cascade" },
  ),
});

export type NewOrgEmailClick = typeof orgEmailClicksTable.$inferInsert;
export type OrgEmailClick = typeof orgEmailClicksTable.$inferSelect;
