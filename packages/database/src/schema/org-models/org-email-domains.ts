import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEmailDomainsTable = pgTable("org_email_domains", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  verified: boolean("verified").default(false),
  email: varchar("email", { length: 255 }),
  public: text("public").unique().notNull(),
  secret: text("secret").unique().notNull(),
  metadata: jsonb("metadata"),
  status: text("status", { enum: ["PENDING", "READY", "BLOCKED"] }),

  // Warm-up tracking
  firstEmailSentAt: timestamp("first_email_sent_at"),
  warmupCompletedAt: timestamp("warmup_completed_at"),
  dailyLimit: integer("daily_limit"),
});

export type NewOrgEmailDomain = typeof orgEmailDomainsTable.$inferInsert;
export type OrgEmailDomain = typeof orgEmailDomainsTable.$inferSelect;
