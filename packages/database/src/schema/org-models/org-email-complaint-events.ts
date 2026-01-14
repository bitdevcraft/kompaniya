import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";

// Complaint events table (eventType = COMPLAINT)
export const orgEmailComplaintEventsTable = pgTable(
  "org_email_complaint_events",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    messageId: text("message_id").notNull(),
    orgEmailEventId: uuid("org_email_event_id").references(
      () => orgEmailEventsTable.id,
    ),

    // Complaint feedback type
    complaintFeedbackType: text("complaint_feedback_type"),

    // Complaint sub-type
    complaintFeedbackSubType: text("complaint_feedback_subtype"),

    // Arrival date from complaint
    arrivalDate: timestamp("arrival_date", { withTimezone: true }),

    // Complaining recipients
    recipients: jsonb("recipients"), // Array of email addresses

    // User agent
    userAgent: text("user_agent"),

    // Complaint feedback ID
    complaintFeedbackId: text("complaint_feedback_id"),

    eventTimestamp: timestamp("event_timestamp", {
      withTimezone: true,
    }).notNull(),
  },
);

export type NewOrgEmailComplaintEvent =
  typeof orgEmailComplaintEventsTable.$inferInsert;
export type OrgEmailComplaintEvent =
  typeof orgEmailComplaintEventsTable.$inferSelect;
