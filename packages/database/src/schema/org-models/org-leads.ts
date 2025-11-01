import {
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgLeadsTable = pgTable("org_leads", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  salutation: varchar("salutation", { length: 255 }),
  name: varchar("name", { length: 1024 }),
  phone: varchar("phone", { length: 50 }),
  phoneE164: varchar("phone_e164", { length: 50 }),

  email: varchar("email", { length: 255 }),
  emailNormalized: text("email_normalized"),
  nationality: varchar("nationality", { length: 255 }),

  // Additional Data
  tags: text("tags").array(),
  categories: text("categories").array(),

  notes: text("notes"),

  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  nextActivityAt: timestamp("next_activity_at", { withTimezone: true }),
  score: numeric("score", { precision: 10, scale: 2 }),
});

export type NewOrgLead = typeof orgLeadsTable.$inferInsert;
export type OrgLead = typeof orgLeadsTable.$inferSelect;
