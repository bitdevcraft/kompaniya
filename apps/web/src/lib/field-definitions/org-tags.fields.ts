import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Tags (org_tags)
 */
export const orgTagsFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    category: "identity",
    group: "Tag Info",
    sortOrder: 1,
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    category: "metadata",
    group: "Details",
    sortOrder: 1,
  },
  {
    id: "color",
    label: "Color",
    type: "text",
    category: "metadata",
    group: "Appearance",
    sortOrder: 1,
  },
];
