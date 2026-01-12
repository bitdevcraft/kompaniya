import { FieldOption as RecordFieldOption } from "@repo/domain";

import { RecordPageLayout } from "@/components/record-page/layout";

import type { ProjectRecordFormValues } from "./project-record-schema";

const STATUS_OPTIONS: RecordFieldOption[] = [
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
];

export const projectRecordLayout: RecordPageLayout<ProjectRecordFormValues> = {
  header: {
    chips: [
      {
        fieldId: "developerName",
        id: "developer-chip",
      },
    ],
    metadata: [
      {
        fieldId: "createdAt",
        id: "project-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "project-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled project",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Basic project information.",
          fields: [
            { id: "name", label: "Name", type: "text" },
            {
              id: "developerName",
              label: "Developer Name",
              type: "text",
            },
            {
              description: "Current status of the project.",
              id: "status",
              label: "Status",
              options: STATUS_OPTIONS,
              type: "picklist",
            },
          ],
          id: "project-details",
          title: "Project Details",
        },
        {
          columns: 2,
          description: "Project timeline and scale.",
          fields: [
            { id: "launchYear", label: "Launch Year", type: "number" },
            {
              id: "expectedCompletionYear",
              label: "Expected Completion Year",
              type: "number",
            },
            { id: "totalUnits", label: "Total Units", type: "number" },
          ],
          id: "project-timeline",
          title: "Timeline & Scale",
        },
        {
          columns: 2,
          description: "Project location information.",
          fields: [
            { id: "addressLine1", label: "Address Line 1", type: "text" },
            { id: "addressLine2", label: "Address Line 2", type: "text" },
            { id: "city", label: "City", type: "text" },
            { id: "state", label: "State", type: "text" },
            { id: "country", label: "Country", type: "text" },
          ],
          id: "project-address",
          title: "Address",
        },
      ],
    },
    firstColumn: { sections: [] },
    secondColumn: {
      sections: [
        {
          description: "Additional details about the project.",
          fields: [
            {
              id: "description",
              label: "Description",
              type: "textarea",
            },
          ],
          id: "project-description",
          title: "Description",
        },
      ],
    },
  },
};
