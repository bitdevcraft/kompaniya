import type { FieldDefinition as DomainFieldDefinition } from "@repo/domain";
import type { FieldValues, Path } from "react-hook-form";

/**
 * Native field definition for the UI builder
 * Extends the domain FieldDefinition with any web-specific properties
 *
 * The domain FieldDefinition already contains all the properties we need:
 * - id, label, type, category
 * - isSystem, isRequired, group, sortOrder, defaultValue
 * - isCustom, customFieldKey, customFieldType
 * - availableOnCreate, description, placeholder, colSpan, readOnly
 * - options, lookup, tag
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NativeFieldDefinition extends DomainFieldDefinition {}

/**
 * React-hook-form typed field definition
 * Extends the domain FieldDefinition with React form types
 *
 * This type is ONLY used in components that work with react-hook-form
 */
export interface RecordLayoutField<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<DomainFieldDefinition, "id"> {
  /** Field ID as a react-hook-form Path */
  id: Path<TFieldValues>;
}

/**
 * Re-export domain types for convenience
 */
export type {
  FieldCategory,
  FieldDataType,
  FieldOption,
  LookupFieldConfig,
  TagFieldConfig,
} from "@repo/domain";
