import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgContactsTable } from "./org-contacts";
import { orgEmailCampaignsTable } from "./org-email-campaigns";
import { orgEmailsTable } from "./org-emails";

export const orgEmailCampaignRecipientsTable = pgTable(
  "org_email_campaign_recipients",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,
    ...baseCustomFieldModel,

    orgEmailCampaignId: uuid("org_email_campaign_id")
      .references(() => orgEmailCampaignsTable.id, { onDelete: "cascade" })
      .notNull(),
    crmContactId: uuid("crm_contact_id").references(() => orgContactsTable.id, {
      onDelete: "set null",
    }),
    orgEmailId: uuid("org_email_id").references(() => orgEmailsTable.id, {
      onDelete: "set null",
    }),

    // Recipient details (snapshot in case contact is deleted)
    email: text("email").notNull(),
    recipientData: jsonb("recipient_data"),

    // Test email flag
    isTest: boolean("is_test").default(false),

    // Send tracking
    status: text("status", {
      enum: ["PENDING", "QUEUED", "SENT", "FAILED", "BOUNCED"],
    }).default("PENDING"),

    queuedAt: timestamp("queued_at"),
    sentAt: timestamp("sent_at"),
    failedAt: timestamp("failed_at"),
    failureReason: text("failure_reason"),

    // Batch tracking for warm-up
    batchNumber: integer("batch_number"),
    retryCount: integer("retry_count").default(0),
  },
);

export type NewOrgEmailCampaignRecipient =
  typeof orgEmailCampaignRecipientsTable.$inferInsert;
export type OrgEmailCampaignRecipient =
  typeof orgEmailCampaignRecipientsTable.$inferSelect;
