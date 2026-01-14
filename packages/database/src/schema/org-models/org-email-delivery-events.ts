import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Delivery events table (eventType = DELIVERY)
export const orgEmailDeliveryEventsTable = pgTable(
  "org_email_delivery_events",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    messageId: text("message_id").notNull(),
    orgEmailEventId: uuid("org_email_event_id").references(
      () => orgEmailEventsTable.id,
    ),

    // Delivery status
    status: text("status"),

    // Processing time in milliseconds
    processingTimeMillis: text("processing_time_millis"),

    // SMTP response
    smtpResponse: text("smtp_response"),

    // Reporting MTA
    reportingMta: text("reporting_mta"),

    // Recipients
    recipients: jsonb("recipients"),

    eventTimestamp: timestamp("event_timestamp", {
      withTimezone: true,
    }).notNull(),
  },
);

export type NewOrgEmailDeliveryEvent =
  typeof orgEmailDeliveryEventsTable.$inferInsert;
export type OrgEmailDeliveryEvent =
  typeof orgEmailDeliveryEventsTable.$inferSelect;
