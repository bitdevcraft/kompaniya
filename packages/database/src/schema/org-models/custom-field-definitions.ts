import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { organizationsTable } from "../auth";
import { usersTable } from "../auth";

/**
 * Custom field type enumeration
 * Defines the supported data types for custom fields
 */
export const customFieldTypeEnum = pgEnum("custom_field_type", [
  "string",
  "number",
  "boolean",
  "date",
  "datetime",
  "single_select",
  "multi_select",
  "json",
  "reference",
]);

/**
 * Custom field definitions table
 * Stores metadata about tenant-defined custom fields for entity types
 *
 * Multi-tenant: Each organization can define their own custom fields
 * Soft-delete: is_deleted flag allows safe deletion
 * Unique constraint: (organization_id, entity_type, key) must be unique (excluding soft-deleted)
 */
export const customFieldDefinitionsTable = pgTable(
  "custom_field_definitions",
  {
    ...baseIdModel,
    ...baseTimestampModel,

    // Tenant isolation
    ...baseOrganizationModel,

    // Entity configuration
    entityType: varchar("entity_type", { length: 128 }).notNull(),
    key: varchar("key", { length: 50 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    description: text("description"),

    // Field type and validation
    fieldType: customFieldTypeEnum("field_type").notNull(),
    isRequired: boolean("is_required").notNull().default(false),
    defaultValue: jsonb("default_value"),

    // Choices for single/multi-select fields
    // Format: [{label: string, value: string}, ...]
    choices: jsonb("choices").$type<{ label: string; value: string }[]>(),

    // Additional validation rules (Zod-compatible)
    // Format: {min?: number, max?: number, minLength?: number, maxLength?: number, pattern?: string, ...}
    validation: jsonb("validation").$type<Record<string, unknown>>(),

    // Index governance
    isIndexed: boolean("is_indexed").notNull().default(false),

    // Soft delete
    isDeleted: boolean("is_deleted").notNull().default(false),

    // Audit
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    // Unique constraint on (organization_id, entity_type, key)
    // Note: Partial unique index (excluding soft-deleted) needs to be added via migration
    unique("custom_field_definitions_org_entity_key_unique").on(
      table.organizationId,
      table.entityType,
      table.key,
    ),
  ],
);

/**
 * Relations for custom field definitions
 */
export const customFieldDefinitionRelations = relations(
  customFieldDefinitionsTable,
  ({ one }) => ({
    organization: one(organizationsTable, {
      fields: [customFieldDefinitionsTable.organizationId],
      references: [organizationsTable.id],
    }),
    creator: one(usersTable, {
      fields: [customFieldDefinitionsTable.createdBy],
      references: [usersTable.id],
    }),
  }),
);

/**
 * Choice option type for select fields
 */
export interface ChoiceOption {
  label: string;
  value: string;
}
export type CustomFieldDefinition =
  typeof customFieldDefinitionsTable.$inferSelect;

/**
 * Custom field type values
 */
export type CustomFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "single_select"
  | "multi_select"
  | "json"
  | "reference";

/**
 * Type inference helpers
 */
export type NewCustomFieldDefinition =
  typeof customFieldDefinitionsTable.$inferInsert;

/**
 * Reference value type for reference fields
 */
export interface ReferenceValue {
  entity_type: string;
  id: string;
}

/**
 * Validation rules type
 */
export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  [key: string]: unknown;
}
