import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Bounce events table (eventType = BOUNCE) - detailed bounce info
export const orgEmailBounceEventsTable = pgTable("org_email_bounce_events", {
  ...baseIdModel,
  ...baseTimestampModel,

  messageId: text("message_id").notNull(),
  orgEmailEventId: uuid("org_email_event_id").references(
    () => orgEmailEventsTable.id,
  ),

  // Bounce type from SES
  bounceType: text("bounce_type", {
    enum: ["Undetermined", "Soft", "Hard"],
  }).notNull(),

  // Bounce sub-type
  bounceSubType: text("bounce_subtype"),

  // Diagnostic code
  diagnosticCode: text("diagnostic_code"),

  // Bounced recipient(s)
  recipients: jsonb("recipients"), // Array of { emailAddress, status?, diagnosticCode? }

  // Timestamp from event
  eventTimestamp: timestamp("event_timestamp", {
    withTimezone: true,
  }).notNull(),
});

export type NewOrgEmailBounceEvent =
  typeof orgEmailBounceEventsTable.$inferInsert;
export type OrgEmailBounceEvent = typeof orgEmailBounceEventsTable.$inferSelect;
