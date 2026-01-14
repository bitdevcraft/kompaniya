import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";
import { orgEmailsTable } from "./org-emails";

// Open events table (eventType = OPEN)
export const orgEmailOpenEventsTable = pgTable("org_email_open_events", {
  ...baseIdModel,
  ...baseTimestampModel,

  messageId: text("message_id").notNull(),
  orgEmailEventId: uuid("org_email_event_id").references(
    () => orgEmailEventsTable.id,
  ),
  orgEmailId: uuid("org_email_id").references(() => orgEmailsTable.id, {
    onDelete: "cascade",
  }),

  // IP address that opened the email
  ipAddress: text("ip_address"),

  // The user agent that opened the email
  userAgent: text("user_agent"),

  eventTimestamp: timestamp("event_timestamp", {
    withTimezone: true,
  }).notNull(),
});

export type NewOrgEmailOpenEvent = typeof orgEmailOpenEventsTable.$inferInsert;
export type OrgEmailOpenEvent = typeof orgEmailOpenEventsTable.$inferSelect;
