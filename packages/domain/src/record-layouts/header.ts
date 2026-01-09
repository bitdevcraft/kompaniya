/**
 * Avatar configuration for record page header
 */
export interface HeaderAvatar {
  /** Field ID to use for avatar image */
  imageFieldId?: string;
  /** Field ID to use for fallback (typically first letter) */
  fallbackFieldId?: string;
}

/**
 * Chip configuration for record page header
 */
export interface HeaderChip {
  /** Unique identifier for this chip */
  id: string;
  /** Field ID to reference */
  fieldId: string;
  /** Icon to display */
  icon?: HeaderIconType;
  /** Type of link to generate */
  linkType?: HeaderLinkType;
  /** Prefix to display before the value */
  prefix?: string;
  /** Suffix to display after the value */
  suffix?: string;
}

/**
 * Data type for header text fields
 */
export type HeaderDataType = "text" | "number" | "date" | "datetime";

/**
 * Icon types for header chips
 */
export type HeaderIconType =
  | "user"
  | "mail"
  | "phone"
  | "globe"
  | "tags"
  | "building"
  | "calendar"
  | "mapPin"
  | "sparkles";

/**
 * Link type for header chips
 */
export type HeaderLinkType = "mailto" | "tel" | "url";

/**
 * Metadata item for record page header
 */
export interface HeaderMetadata {
  /** Unique identifier for this metadata item */
  id: string;
  /** Field ID to reference */
  fieldId: string;
  /** Label for the metadata */
  label: string;
  /** Data type for formatting */
  type?: HeaderDataType;
}

/**
 * Text configuration for header (title/subtitle)
 */
export interface HeaderText {
  /** Field ID to reference */
  fieldId: string;
  /** Fallback text if field is empty */
  fallback?: string;
  /** Prefix to display before the value */
  prefix?: string;
  /** Suffix to display after the value */
  suffix?: string;
  /** Data type for formatting */
  type?: HeaderDataType;
}

/**
 * Complete header configuration for record page
 */
export interface RecordLayoutHeader {
  /** Title configuration */
  title: HeaderText;
  /** Subtitle configuration */
  subtitle?: HeaderText[];
  /** Avatar configuration */
  avatar?: HeaderAvatar;
  /** Chips to display */
  chips?: HeaderChip[];
  /** Metadata to display */
  metadata?: HeaderMetadata[];
}
