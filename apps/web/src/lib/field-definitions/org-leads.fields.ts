import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Leads (org_leads)
 */
export const orgLeadsFields: NativeFieldDefinition[] = [
  // Identity Fields
  {
    id: "name",
    label: "Name",
    type: "text",
    category: "identity",
    group: "Profile",
    sortOrder: 1,
  },
  {
    id: "firstName",
    label: "First name",
    type: "text",
    category: "identity",
    group: "Profile",
    sortOrder: 2,
  },
  {
    id: "lastName",
    label: "Last name",
    type: "text",
    category: "identity",
    group: "Profile",
    sortOrder: 3,
  },

  // Contact Fields
  {
    id: "email",
    label: "Email",
    type: "text",
    category: "contact",
    group: "Contact",
    sortOrder: 1,
  },
  {
    id: "phone",
    label: "Phone",
    type: "phone",
    category: "contact",
    group: "Contact",
    sortOrder: 2,
  },

  // Organization Fields
  {
    id: "companyName",
    label: "Company",
    type: "text",
    category: "organization",
    group: "Organization",
    sortOrder: 1,
  },
  {
    id: "industry",
    label: "Industry",
    type: "text",
    category: "organization",
    group: "Organization",
    sortOrder: 2,
  },

  // Classification Fields
  {
    id: "tags",
    label: "Tags",
    type: "tag",
    category: "classification",
    group: "Segmentation",
    sortOrder: 1,
    tag: {
      relatedType: "lead",
    },
  },

  // Lead-specific Fields
  {
    id: "score",
    label: "Lead score",
    type: "number",
    category: "metadata",
    group: "Lead Details",
    sortOrder: 1,
  },
  {
    id: "nationality",
    label: "Region",
    type: "text",
    category: "metadata",
    group: "Lead Details",
    sortOrder: 2,
  },

  // Activity Fields
  {
    id: "lastActivityAt",
    label: "Last activity",
    type: "datetime",
    category: "activity",
    group: "Activity",
    sortOrder: 1,
    isReadOnly: true,
  },
  {
    id: "nextActivityAt",
    label: "Next activity",
    type: "datetime",
    category: "activity",
    group: "Activity",
    sortOrder: 2,
  },

  // Metadata
  {
    id: "notes",
    label: "Notes",
    type: "textarea",
    category: "metadata",
    group: "Notes",
    sortOrder: 1,
  },
];
