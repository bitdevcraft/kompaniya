import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Send events table (eventType = SEND)
export const orgEmailSendEventsTable = pgTable("org_email_send_events", {
  ...baseIdModel,
  ...baseTimestampModel,

  messageId: text("message_id").notNull(),
  orgEmailEventId: uuid("org_email_event_id").references(
    () => orgEmailEventsTable.id,
  ),

  // Number of recipients
  recipientCount: text("recipient_count"),

  // Sending account ID
  sendingAccountId: text("sending_account_id"),

  eventTimestamp: timestamp("event_timestamp", {
    withTimezone: true,
  }).notNull(),
});

export type NewOrgEmailSendEvent = typeof orgEmailSendEventsTable.$inferInsert;
export type OrgEmailSendEvent = typeof orgEmailSendEventsTable.$inferSelect;
