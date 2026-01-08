import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Tasks (org_tasks)
 */
export const orgTasksFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Task name",
    type: "text",
    category: "identity",
    group: "Task Info",
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
    group: "Task Status",
    sortOrder: 1,
  },
  {
    id: "priority",
    label: "Priority",
    type: "text",
    category: "metadata",
    group: "Task Status",
    sortOrder: 2,
  },
  {
    id: "dueDate",
    label: "Due date",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 1,
  },
  {
    id: "completedAt",
    label: "Completed at",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 2,
  },
];
