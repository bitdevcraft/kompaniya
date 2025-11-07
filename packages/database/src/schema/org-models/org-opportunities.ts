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
  varchar,
} from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

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

  name: varchar("name", { length: 1024 }),

  description: text("description"),

  ownerUserId: varchar("owner_user_id", { length: 36 }).notNull(),
  teamId: varchar("team_id", { length: 36 }),

  accountId: varchar("account_id", { length: 36 }).notNull(),
  primaryContactId: varchar("primary_contact_id", { length: 36 }),

  type: opportunityTypeEnum("type").default("new_business").notNull(),
  pipelineId: varchar("pipeline_id", { length: 36 }).notNull(),
  stageId: varchar("stage_id", { length: 36 }).notNull(),
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
  campaignId: varchar("campaign_id", { length: 36 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  utmTerm: varchar("utm_term", { length: 100 }),
  utmContent: varchar("utm_content", { length: 100 }),

  lostReasonId: varchar("lost_reason_id", { length: 36 }),
  lostReasonNote: text("lost_reason_note"),

  priority: opportunityPriorityEnum("priority"),
  tags: varchar("tags", { length: 255 }).array(),

  customFields: jsonb("custom_fields"),
  isArchived: boolean("is_archived").default(false).notNull(),
});

export type NewOrgOpportunity = typeof orgOpportunitiesTable.$inferInsert;
export type OrgOpportunity = typeof orgOpportunitiesTable.$inferSelect;
