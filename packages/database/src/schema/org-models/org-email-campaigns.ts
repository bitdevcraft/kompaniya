import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgEmailDomainsTable } from "./org-email-domains";
import { mjmlEditorField, orgEmailTemplatesTable } from "./org-email-templates";
import { orgEmailTestReceiversTable } from "./org-email-test-receivers";

export const orgEmailCampaignsTable = pgTable("org_email_campaigns", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  subject: varchar("subject", { length: 998 }),
  body: text("body"),

  ...mjmlEditorField,

  orgEmailDomainId: uuid("org_email_domain_id").references(
    () => orgEmailDomainsTable.id,
    {
      onDelete: "set null",
    },
  ),
  orgEmailTemplateId: uuid("org_email_template_id").references(
    () => orgEmailTemplatesTable.id,
    {
      onDelete: "set null",
    },
  ),
  orgEmailTestReceiverId: uuid("org_email_test_receiver_id").references(
    () => orgEmailTestReceiversTable.id,
    { onDelete: "set null" },
  ),
  targetCategories: jsonb("target_categories").$type<string[]>().default([]),
  targetTags: jsonb("target_tags").$type<string[]>().default([]),
  tagMatchType: text("tag_match_type", {
    enum: ["ALL", "ANY"],
  }).default("ALL"),

  status: text("status", {
    enum: [
      "DRAFT",
      "SCHEDULED",
      "SENDING",
      "PAUSED",
      "COMPLETED",
      "CANCELLED",
      "FAILED",
    ],
  }).default("DRAFT"),

  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),

  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  bouncedCount: integer("bounced_count").default(0),
  complainedCount: integer("complained_count").default(0),
});

export type NewOrgEmailCampaign = typeof orgEmailCampaignsTable.$inferInsert;
export type OrgEmailCampaign = typeof orgEmailCampaignsTable.$inferSelect;
