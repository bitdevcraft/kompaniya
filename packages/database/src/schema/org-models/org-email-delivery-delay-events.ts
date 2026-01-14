import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Delivery Delay events table
export const orgEmailDeliveryDelayEventsTable = pgTable(
  "org_email_delivery_delay_events",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    messageId: text("message_id").notNull(),
    orgEmailEventId: uuid("org_email_event_id").references(
      () => orgEmailEventsTable.id,
    ),

    // Delay type
    delayType: text("delay_type"),

    // Recipients affected
    recipients: jsonb("recipients"),

    // Delay time in seconds
    delaySeconds: text("delay_seconds"),

    eventTimestamp: timestamp("event_timestamp", {
      withTimezone: true,
    }).notNull(),
  },
);

export type NewOrgEmailDeliveryDelayEvent =
  typeof orgEmailDeliveryDelayEventsTable.$inferInsert;
export type OrgEmailDeliveryDelayEvent =
  typeof orgEmailDeliveryDelayEventsTable.$inferSelect;
