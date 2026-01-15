import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { teamsTable, usersTable } from "../auth";
import { orgAccountsTable } from "./org-accounts";
import { orgContactsTable } from "./org-contacts";

export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "open",
  "won",
  "lost",
  "on_hold",
]);
export const opportunityForecastCategoryEnum = pgEnum(
  "opportunity_forecast_category",
  ["pipeline", "best_case", "commit", "omitted", "closed"],
);
export const opportunityTypeEnum = pgEnum("opportunity_type", [
  "new_business",
  "renewal",
  "upsell",
  "cross_sell",
]);
export const opportunityPriorityEnum = pgEnum("opportunity_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const orgOpportunitiesTable = pgTable("org_opportunities", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 1024 }),

  description: text("description"),

  ownerUserId: uuid("owner_user_id").references(() => usersTable.id),
  teamId: uuid("team_id").references(() => teamsTable.id, {
    onDelete: "set null",
  }),

  accountId: uuid("account_id").references(() => orgAccountsTable.id),
  primaryContactId: uuid("primary_contact_id").references(
    () => orgContactsTable.id,
  ),

  type: opportunityTypeEnum("type").default("new_business").notNull(),
  status: opportunityStatusEnum("status").default("open").notNull(),
  probability: integer("probability"),
  forecastCategory: opportunityForecastCategoryEnum("forecast_category"),

  amount: numeric("amount", { precision: 14, scale: 2 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 }),
  amountHome: numeric("amount_home", { precision: 14, scale: 2 }),

  expectedCloseDate: date("expected_close_date"),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  nextActivityAt: timestamp("next_activity_at", { withTimezone: true }),
  closedWonAt: timestamp("closed_won_at", { withTimezone: true }),
  closedLostAt: timestamp("closed_lost_at", { withTimezone: true }),

  nextStep: text("next_step"),

  source: varchar("source", { length: 128 }),
  sourceDetail: varchar("source_detail", { length: 256 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  utmTerm: varchar("utm_term", { length: 100 }),
  utmContent: varchar("utm_content", { length: 100 }),

  lostReasonId: varchar("lost_reason_id", { length: 36 }),
  lostReasonNote: text("lost_reason_note"),

  priority: opportunityPriorityEnum("priority"),
  tags: jsonb("tags").$type<string[]>().default([]),

  customFields: jsonb("custom_fields"),
  isArchived: boolean("is_archived").default(false).notNull(),
});

export type NewOrgOpportunity = typeof orgOpportunitiesTable.$inferInsert;
export type OrgOpportunity = typeof orgOpportunitiesTable.$inferSelect;
