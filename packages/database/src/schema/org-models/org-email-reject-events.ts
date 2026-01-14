import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Reject events table (eventType = REJECT)
export const orgEmailRejectEventsTable = pgTable("org_email_reject_events", {
  ...baseIdModel,
  ...baseTimestampModel,

  messageId: text("message_id").notNull(),
  orgEmailEventId: uuid("org_email_event_id").references(
    () => orgEmailEventsTable.id,
  ),

  // Reason for rejection
  reason: text("reason").notNull(),

  eventTimestamp: timestamp("event_timestamp", {
    withTimezone: true,
  }).notNull(),
});

export type NewOrgEmailRejectEvent =
  typeof orgEmailRejectEventsTable.$inferInsert;
export type OrgEmailRejectEvent = typeof orgEmailRejectEventsTable.$inferSelect;
