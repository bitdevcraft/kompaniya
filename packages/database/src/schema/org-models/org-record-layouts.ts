import { relations } from "drizzle-orm";
import { boolean, jsonb, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { organizationsTable } from "../auth";
import { usersTable } from "../auth";

/**
 * Record layout entity type enumeration
 * All org models that support dynamic layouts
 */
export const recordLayoutEntityTypeEnum = pgEnum("record_layout_entity_type", [
  "org_contacts",
  "org_leads",
  "org_accounts",
  "org_opportunities",
  "org_activities",
  "org_categories",
  "org_tags",
  "org_events",
  "org_tasks",
  "org_email_templates",
  "org_email_campaigns",
  "org_email_domains",
  "org_real_estate_projects",
  "org_real_estate_properties",
  "org_real_estate_bookings",
  "org_payment_plans",
  "org_payment_plan_templates",
  "org_email_test_receivers",
  "org_emails",
  "org_email_clicks",
  "org_real_estate_booking_buyers",
]);

/**
 * Record layout section columns configuration
 */
export interface LayoutSectionItem {
  id: string;
  title?: string;
  description?: string;
  columns?: number;
  fields?: unknown[];
  componentId?: string;
  componentProps?: Record<string, unknown>;
}

/**
 * Record layout header configuration
 */
export interface RecordLayoutHeader {
  avatar?: { fallbackFieldId?: string; imageFieldId?: string };
  chips?: {
    fieldId: string;
    icon?: string;
    id: string;
    linkType?: "mailto" | "tel" | "url";
  }[];
  metadata?: {
    fieldId: string;
    id: string;
    label: string;
    type?: string;
  }[];
  subtitle?: {
    fieldId: string;
    prefix?: string;
    suffix?: string;
    type?: string;
  }[];
  title: { fieldId: string; fallback?: string };
}

export interface RecordLayoutSectionColumns {
  firstColumn?: { sections?: LayoutSectionItem[]; fieldsGridColumns?: number };
  header?: { sections?: LayoutSectionItem[]; fieldsGridColumns?: number };
  secondColumn?: { sections?: LayoutSectionItem[]; fieldsGridColumns?: number };
  sidebar?: "firstColumn" | "secondColumn" | null;
}

/**
 * Record layouts table
 * Stores customized layouts per organization per entity type
 *
 * Multi-tenant: Each organization can customize their own layouts
 * Soft-delete: is_deleted flag allows safe deletion/reset to default
 */
export const orgRecordLayoutsTable = pgTable("org_record_layouts", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,

  // Entity configuration
  entityType: recordLayoutEntityTypeEnum("entity_type").notNull(),

  // Layout configuration (matches RecordPageLayout interface structure)
  header: jsonb("header").$type<RecordLayoutHeader>().notNull(),
  sectionColumns: jsonb("sectionColumns").$type<RecordLayoutSectionColumns>(),
  sections: jsonb("sections").$type<LayoutSectionItem[]>(),
  supplementalFields: jsonb("supplemental_fields").$type<unknown[]>(),

  // Configuration flags
  autoIncludeCustomFields: boolean("auto_include_custom_fields")
    .notNull()
    .default(true),

  // If true, this layout was manually customized (not default)
  isCustomized: boolean("is_customized").notNull().default(false),

  // Soft delete
  isDeleted: boolean("is_deleted").notNull().default(false),

  // Audit
  createdBy: uuid("created_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
});

/**
 * Type inference helpers
 */
export type NewOrgRecordLayout = typeof orgRecordLayoutsTable.$inferInsert;
export type OrgRecordLayout = typeof orgRecordLayoutsTable.$inferSelect;

/**
 * Record layout entity type values
 */
export type RecordLayoutEntityType =
  (typeof orgRecordLayoutsTable.$inferInsert)["entityType"];

/**
 * Relations for record layouts
 */
export const orgRecordLayoutRelations = relations(
  orgRecordLayoutsTable,
  ({ one }) => ({
    organization: one(organizationsTable, {
      fields: [orgRecordLayoutsTable.organizationId],
      references: [organizationsTable.id],
    }),
    creator: one(usersTable, {
      fields: [orgRecordLayoutsTable.createdBy],
      references: [usersTable.id],
    }),
    updater: one(usersTable, {
      fields: [orgRecordLayoutsTable.updatedBy],
      references: [usersTable.id],
    }),
  }),
);
