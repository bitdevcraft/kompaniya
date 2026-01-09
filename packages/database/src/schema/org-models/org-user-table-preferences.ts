import { relations } from "drizzle-orm";
import { boolean, jsonb, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { organizationsTable } from "../auth";
import { usersTable } from "../auth";

/**
 * Table entity type enumeration
 * All org models that support dynamic table column preferences
 * Matches the entity types from record layouts
 */
export const tablePreferencesEntityTypeEnum = pgEnum(
  "table_preferences_entity_type",
  [
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
  ],
);

/**
 * Column order array - defines the display order of columns
 * Array of column IDs in their display order
 */
export type ColumnOrderState = string[];

/**
 * Column pinning state - defines pinned columns
 */
export interface ColumnPinningState {
  left?: readonly string[] | string[];
  right?: readonly string[] | string[];
}

/**
 * Column visibility state - maps column IDs to visibility boolean
 * Keys are column IDs (e.g., "name", "email", "customFields.someField")
 * Values are boolean (true = visible, false = hidden)
 */
export type ColumnVisibilityState = Record<string, boolean>;

/**
 * User table preferences configuration
 */
export interface UserTablePreferences {
  visibility: ColumnVisibilityState;
  order: ColumnOrderState;
  pinning?: ColumnPinningState;
}

/**
 * User table preferences table
 * Stores per-user table column visibility, order, and pinning per entity type
 *
 * Multi-tenant: scoped to organization
 * Per-user: each user has their own preferences
 * Soft-delete: is_deleted flag allows safe deletion/reset to default
 */
export const orgUserTablePreferencesTable = pgTable(
  "org_user_table_preferences",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    // Organization reference (for multi-tenancy)
    organizationId: uuid("organization_id")
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    // User who owns these preferences
    userId: uuid("user_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    // Entity configuration
    entityType: tablePreferencesEntityTypeEnum("entity_type").notNull(),

    // Table preferences configuration
    preferences: jsonb("preferences").$type<UserTablePreferences>().notNull(),

    // If true, this preference was manually customized (not default)
    isCustomized: boolean("is_customized").notNull().default(false),

    // Soft delete
    isDeleted: boolean("is_deleted").notNull().default(false),
  },
);

/**
 * Type inference helpers
 */
export type NewOrgUserTablePreference =
  typeof orgUserTablePreferencesTable.$inferInsert;
export type OrgUserTablePreference =
  typeof orgUserTablePreferencesTable.$inferSelect;
export type TablePreferencesEntityType =
  (typeof orgUserTablePreferencesTable.$inferInsert)["entityType"];

/**
 * Relations for user table preferences
 */
export const orgUserTablePreferencesRelations = relations(
  orgUserTablePreferencesTable,
  ({ one }) => ({
    organization: one(organizationsTable, {
      fields: [orgUserTablePreferencesTable.organizationId],
      references: [organizationsTable.id],
    }),
    user: one(usersTable, {
      fields: [orgUserTablePreferencesTable.userId],
      references: [usersTable.id],
    }),
  }),
);
