import type { RecordLayoutField } from "@/components/record-page/layout";

/**
 * Field category for organization in the UI palette
 */
export type FieldCategory =
  | "identity"
  | "contact"
  | "organization"
  | "classification"
  | "system"
  | "address"
  | "consent"
  | "activity"
  | "metadata"
  | "custom";

/**
 * Extended field definition interface for the UI builder
 * Adds metadata needed for the field palette and builder
 */
export interface NativeFieldDefinition extends RecordLayoutField {
  /** Category for grouping in the field palette */
  category: FieldCategory;
  /** System fields cannot be removed from layouts */
  isSystem?: boolean;
  /** Whether this field is required (validation) */
  isRequired?: boolean;
  /** Whether this field is read-only */
  isReadOnly?: boolean;
  /** Group name for organization (e.g., "Profile", "Address") */
  group?: string;
  /** Default sort order within group */
  sortOrder?: number;
  /** Default value for the field */
  defaultValue?: unknown;
  /** Whether this is a custom field (vs native field) */
  isCustom?: boolean;
  /** The key of the custom field (from custom_field_definitions.key) */
  _customFieldKey?: string;
  /** The field type from custom_field_definitions (string, number, etc.) */
  _customFieldType?: string;
}
