import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Real Estate Projects (org_real_estate_projects)
 */
export const orgRealEstateProjectsFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Project name",
    type: "text",
    category: "identity",
    group: "Project Info",
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
    id: "status",
    label: "Status",
    type: "text",
    category: "metadata",
    group: "Project Status",
    sortOrder: 1,
  },
  {
    id: "startDate",
    label: "Start date",
    type: "date",
    category: "activity",
    group: "Timeline",
    sortOrder: 1,
  },
  {
    id: "completionDate",
    label: "Completion date",
    type: "date",
    category: "activity",
    group: "Timeline",
    sortOrder: 2,
  },
];
