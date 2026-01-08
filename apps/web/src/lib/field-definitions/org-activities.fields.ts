import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Activities (org_activities)
 */
export const orgActivitiesFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Subject",
    type: "text",
    category: "identity",
    group: "Activity Info",
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
    group: "Details",
    sortOrder: 2,
  },
  {
    id: "activityType",
    label: "Activity type",
    type: "text",
    category: "metadata",
    group: "Details",
    sortOrder: 3,
  },
  {
    id: "dueDate",
    label: "Due date",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 1,
  },
];
