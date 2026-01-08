import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Events (org_events)
 */
export const orgEventsFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Event name",
    type: "text",
    category: "identity",
    group: "Event Info",
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
    id: "startDate",
    label: "Start date",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 1,
  },
  {
    id: "endDate",
    label: "End date",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 2,
  },
  {
    id: "location",
    label: "Location",
    type: "text",
    category: "metadata",
    group: "Details",
    sortOrder: 2,
  },
];
