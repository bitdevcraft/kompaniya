/**
 * Base field definition - completely framework agnostic
 * This is the core domain type that can be shared across all layers
 */
export interface BaseFieldDefinition {
  /** Unique identifier for this field */
  id: string;
  /** Display label for the field */
  label: string;
  /** Data type of the field */
  type: FieldDataType;
  /** Category for grouping in the field palette */
  category: FieldCategory;
  /** Whether the field should appear on create/new forms */
  availableOnCreate?: boolean;
  /** Description/help text for the field */
  description?: string;
  /** Placeholder text for input fields */
  placeholder?: string;
  /** Column span in grid layout (1-4) */
  colSpan?: number;
  /** Whether this field is read-only */
  readOnly?: boolean;
  /** Options for picklist/multipicklist fields */
  options?: FieldOption[];
  /** Reference configuration for relationship fields */
  reference?: ReferenceFieldConfig;
  /** Tag configuration for tag fields */
  tag?: TagFieldConfig;
}

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
 * Core field data types - framework agnostic
 * These represent the fundamental data types for fields
 */
export type FieldDataType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "picklist"
  | "multipicklist"
  | "tag"
  | "phone"
  | "html"
  | "mjml"
  | "reference"
  | "payment_plan_milestones"
  | "payment_plan_fees"
  | "payment_schedule";

/**
 * Extended field definition with UI builder metadata
 * This extends the base definition with metadata needed for the field palette
 */
export interface FieldDefinition extends BaseFieldDefinition {
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
  /** The key of the custom field */
  customFieldKey?: string;
  /** The field type from custom field definitions */
  customFieldType?: string;
}

/**
 * Option for picklist/multipicklist fields
 */
export interface FieldOption {
  label: string;
  value: string;
}

/**
 * Reference field configuration for relationship fields
 * This is used for fields that reference other entities
 */
export interface ReferenceFieldConfig {
  /** Endpoint used to fetch a specific record by ID */
  findByIdEndpoint: string;
  /** Key in the response representing the display label */
  labelKey?: string;
  /** Key in the response representing the option description */
  descriptionKey?: string;
  /** Key in the response representing the option value */
  valueKey?: string;
  /** Query parameter to use when searching */
  queryParam?: string;
  /** Query parameter to use when looking up by ID */
  idParam?: string;
  /** Endpoint used to query for options */
  searchEndpoint: string;
  /** Base URL for redirecting to the related record */
  redirectBaseUrl?: string | null;
}

/**
 * Tag field configuration for tag-related fields
 */
export interface TagFieldConfig {
  /** Related entity type for the tag */
  relatedType: string;
}
