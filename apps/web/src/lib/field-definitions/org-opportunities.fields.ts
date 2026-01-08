import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Opportunities (org_opportunities)
 */
export const orgOpportunitiesFields: NativeFieldDefinition[] = [
  // Identity Fields
  {
    id: "name",
    label: "Opportunity name",
    type: "text",
    category: "identity",
    group: "Deal Info",
    sortOrder: 1,
  },

  // Pipeline Fields
  {
    id: "amount",
    label: "Amount",
    type: "number",
    category: "metadata",
    group: "Pipeline",
    sortOrder: 1,
  },
  {
    id: "probability",
    label: "Probability (%)",
    type: "number",
    category: "metadata",
    group: "Pipeline",
    sortOrder: 2,
  },
  {
    id: "expectedCloseDate",
    label: "Expected close",
    type: "date",
    category: "metadata",
    group: "Pipeline",
    sortOrder: 3,
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    category: "metadata",
    group: "Pipeline",
    sortOrder: 4,
  },

  // Relationship Fields
  {
    id: "accountId",
    label: "Account",
    type: "text",
    category: "organization",
    group: "Relationships",
    sortOrder: 1,
  },

  // Classification Fields
  {
    id: "tags",
    label: "Tags",
    type: "tag",
    category: "classification",
    group: "Tags",
    sortOrder: 1,
    tag: {
      relatedType: "opportunity",
    },
  },

  // Notes Fields
  {
    id: "nextStep",
    label: "Next step",
    type: "text",
    category: "metadata",
    group: "Notes",
    sortOrder: 1,
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    category: "metadata",
    group: "Notes",
    sortOrder: 2,
  },
];
