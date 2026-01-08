import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Accounts (org_accounts)
 */
export const orgAccountsFields: NativeFieldDefinition[] = [
  // Identity Fields
  {
    id: "name",
    label: "Account name",
    type: "text",
    category: "identity",
    group: "Account Info",
    sortOrder: 1,
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
  {
    id: "websiteUrl",
    label: "Website",
    type: "text",
    category: "contact",
    group: "Contact",
    sortOrder: 3,
  },

  // Organization Fields
  {
    id: "industry",
    label: "Industry",
    type: "text",
    category: "organization",
    group: "Organization Details",
    sortOrder: 1,
  },
  {
    id: "annualRevenueBand",
    label: "Revenue band",
    type: "text",
    category: "organization",
    group: "Organization Details",
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
      relatedType: "account",
    },
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
