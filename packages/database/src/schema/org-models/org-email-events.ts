import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

// Event types from AWS SES via SNS
export const sesEventTypeEnum = [
  "SEND",
  "RENDERING_FAILURE",
  "REJECT",
  "DELIVERY",
  "BOUNCE",
  "COMPLAINT",
  "DELIVERY_DELAY",
  "OPEN",
  "CLICK",
] as const;

// Main events table - stores all SES events
export const orgEmailEventsTable = pgTable("org_email_events", {
  ...baseIdModel,
  ...baseTimestampModel,

  // The SES MessageId (matches org_emails.messageId)
  messageId: text("message_id").notNull(),

  // Event type from SES
  eventType: text("event_type", { enum: sesEventTypeEnum }).notNull(),

  // Raw SNS message for debugging/audit
  rawEvent: jsonb("raw_event"),

  // SES-specific event data
  sesData: jsonb("ses_data"),

  // Processing status
  processed: text("processed", { enum: ["PENDING", "SUCCESS", "FAILED"] })
    .notNull()
    .default("PENDING"),

  // Error message if processing failed
  processingError: text("processing_error"),

  // Timestamp from the SES event itself
  eventTimestamp: timestamp("event_timestamp", { withTimezone: true }),
});

export type NewOrgEmailEvent = typeof orgEmailEventsTable.$inferInsert;
export type OrgEmailEvent = typeof orgEmailEventsTable.$inferSelect;
