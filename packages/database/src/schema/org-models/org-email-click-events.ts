import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailEventsTable } from "./org-email-events";
import { orgEmailsTable } from "./org-emails";

// Click events table (eventType = CLICK)
export const orgEmailClickEventsTable = pgTable("org_email_click_events", {
  ...baseIdModel,
  ...baseTimestampModel,

  messageId: text("message_id").notNull(),
  orgEmailEventId: uuid("org_email_event_id").references(
    () => orgEmailEventsTable.id,
  ),
  orgEmailId: uuid("org_email_id").references(() => orgEmailsTable.id, {
    onDelete: "cascade",
  }),

  // The link that was clicked
  link: text("link").notNull(),

  // Link tags from SES
  linkTags: jsonb("link_tags"),

  // The user agent that clicked the link
  userAgent: text("user_agent"),

  eventTimestamp: timestamp("event_timestamp", {
    withTimezone: true,
  }).notNull(),
});

export type NewOrgEmailClickEvent =
  typeof orgEmailClickEventsTable.$inferInsert;
export type OrgEmailClickEvent = typeof orgEmailClickEventsTable.$inferSelect;
