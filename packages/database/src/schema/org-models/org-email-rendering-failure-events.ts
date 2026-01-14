import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Rendering Failure events table
export const orgEmailRenderingFailureEventsTable = pgTable(
  "org_email_rendering_failure_events",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    messageId: text("message_id").notNull(),
    orgEmailEventId: uuid("org_email_event_id").references(
      () => orgEmailEventsTable.id,
    ),

    // Template name
    templateName: text("template_name"),

    // Error message
    errorMessage: text("error_message").notNull(),

    eventTimestamp: timestamp("event_timestamp", {
      withTimezone: true,
    }).notNull(),
  },
);

export type NewOrgEmailRenderingFailureEvent =
  typeof orgEmailRenderingFailureEventsTable.$inferInsert;
export type OrgEmailRenderingFailureEvent =
  typeof orgEmailRenderingFailureEventsTable.$inferSelect;
