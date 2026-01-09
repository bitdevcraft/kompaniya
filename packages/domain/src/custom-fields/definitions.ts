/**
 * Option for select fields
 */
export interface CustomFieldChoice {
  label: string;
  value: string;
}

/**
 * Custom field definition
 */
export interface CustomFieldDefinition {
  /** Unique identifier */
  id: string;
  /** Organization ID */
  organizationId: string;
  /** Entity type this field applies to */
  entityType: string;
  /** Unique key for the field */
  key: string;
  /** Display label */
  label: string;
  /** Description */
  description?: string;
  /** Field data type */
  fieldType: CustomFieldType;
  /** Whether field is required */
  isRequired?: boolean;
  /** Default value */
  defaultValue?: unknown;
  /** Options for select fields */
  choices?: CustomFieldChoice[];
  /** Validation rules */
  validation?: CustomFieldValidation;
  /** Whether field is indexed */
  isIndexed?: boolean;
}

/**
 * Custom field data types
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
 * Validation rules for custom fields
 */
export interface CustomFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  [key: string]: unknown;
}

/**
 * Reference value for reference fields
 */
export interface ReferenceValue {
  entity_type: string;
  id: string;
}
