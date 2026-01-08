import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Categories (org_categories)
 */
export const orgCategoriesFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    category: "identity",
    group: "Category Info",
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
  {
    id: "icon",
    label: "Icon",
    type: "text",
    category: "metadata",
    group: "Appearance",
    sortOrder: 2,
  },
];
