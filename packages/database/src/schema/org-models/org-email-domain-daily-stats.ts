import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailDomainsTable } from "./org-email-domains";

export const orgEmailDomainDailyStatsTable = pgTable(
  "org_email_domain_daily_stats",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    orgEmailDomainId: uuid("org_email_domain_id")
      .references(() => orgEmailDomainsTable.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").notNull(),

    // Date tracking (UTC date)
    date: text("date").notNull(), // Store as YYYY-MM-DD string for simplicity

    // Send counts
    sentCount: integer("sent_count").default(0),
    deliveredCount: integer("delivered_count").default(0),
    bouncedCount: integer("bounced_count").default(0),
    complainedCount: integer("complained_count").default(0),
  },
);

export type NewOrgEmailDomainDailyStats =
  typeof orgEmailDomainDailyStatsTable.$inferInsert;
export type OrgEmailDomainDailyStats =
  typeof orgEmailDomainDailyStatsTable.$inferSelect;
