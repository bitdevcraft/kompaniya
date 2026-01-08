import type { NativeFieldDefinition } from "../types";

/**
 * Common system fields that appear on most entity types
 */
export const COMMON_SYSTEM_FIELDS: NativeFieldDefinition[] = [
  {
    id: "id",
    label: "ID",
    type: "text",
    category: "system",
    isSystem: true,
    isReadOnly: true,
    group: "System",
    sortOrder: 1,
  },
  {
    id: "createdAt",
    label: "Created",
    type: "datetime",
    category: "system",
    isSystem: true,
    isReadOnly: true,
    group: "System",
    sortOrder: 2,
  },
  {
    id: "updatedAt",
    label: "Updated",
    type: "datetime",
    category: "system",
    isSystem: true,
    isReadOnly: true,
    group: "System",
    sortOrder: 3,
  },
];

/**
 * Common identity fields
 */
export const COMMON_IDENTITY_FIELDS: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    category: "identity",
    group: "Identity",
    sortOrder: 1,
  },
];

/**
 * Common metadata fields
 */
export const COMMON_METADATA_FIELDS: NativeFieldDefinition[] = [
  {
    id: "notes",
    label: "Notes",
    type: "textarea",
    category: "metadata",
    group: "Notes",
    sortOrder: 1,
  },
];
