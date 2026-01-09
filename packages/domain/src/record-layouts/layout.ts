import type {
  FieldDataType,
  FieldOption,
  LookupFieldConfig,
  TagFieldConfig,
} from "./field.js";
import type {
  HeaderAvatar as _HeaderAvatar,
  HeaderChip as _HeaderChip,
  HeaderIconType as _HeaderIconType,
  HeaderLinkType as _HeaderLinkType,
  HeaderMetadata as _HeaderMetadata,
  HeaderText as _HeaderText,
  RecordLayoutHeader,
} from "./header.js";

/**
 * Re-export field types for convenience
 */
export type {
  BaseFieldDefinition,
  FieldCategory,
  FieldDataType,
  FieldDefinition,
  FieldOption,
  LookupFieldConfig,
  TagFieldConfig,
} from "./field.js";

/**
 * Re-export header types for convenience
 */
export type {
  HeaderAvatar,
  HeaderChip,
  HeaderIconType,
  HeaderLinkType,
  HeaderMetadata,
  HeaderText,
  RecordLayoutHeader,
} from "./header.js";

/**
 * Field in a layout section
 * Similar to FieldDefinition but with section-specific context
 */
export interface LayoutField {
  /** Unique identifier for this field */
  id: string;
  /** Display label for the field */
  label: string;
  /** Data type of the field */
  type: FieldDataType;
  /** Description/help text */
  description?: string;
  /** Column span in grid layout (1-4) */
  colSpan?: number;
  /** Whether the field should appear on create forms */
  availableOnCreate?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Options for picklist fields */
  options?: FieldOption[];
  /** Lookup configuration */
  lookup?: LookupFieldConfig;
  /** Tag configuration */
  tag?: TagFieldConfig;
}

/**
 * A section in the record layout
 * Contains related fields grouped together
 */
export interface LayoutSection {
  /** Unique identifier for the section */
  id: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Number of columns for field layout (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Fields in this section */
  fields: LayoutField[];
}

/**
 * Column layout configuration
 * Defines how sections are arranged in columns
 */
export interface LayoutSectionColumns {
  /** Header column (top full-width section) */
  header?: LayoutSectionGroup;
  /** First main column */
  firstColumn?: LayoutSectionGroup;
  /** Second main column */
  secondColumn?: LayoutSectionGroup;
  /** Which column acts as the sidebar */
  sidebar?: "firstColumn" | "secondColumn" | null;
}

/**
 * Section group - groups multiple sections together
 */
export interface LayoutSectionGroup {
  /** Sections in this group */
  sections: LayoutSection[];
  /** Default grid columns for fields in this group */
  fieldsGridColumns?: 1 | 2 | 3 | 4;
}

/**
 * Complete record page layout configuration
 * This is the main structure for record layouts
 */
export interface RecordPageLayout {
  /** Header configuration */
  header: RecordLayoutHeader;
  /** Column layout configuration */
  sectionColumns?: LayoutSectionColumns;
  /** Simple sections array (alternative to sectionColumns) */
  sections?: LayoutSection[];
  /** Additional fields that can be added but not in default layout */
  supplementalFields?: LayoutField[];
}
