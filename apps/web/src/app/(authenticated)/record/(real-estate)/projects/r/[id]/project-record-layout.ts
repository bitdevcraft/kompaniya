import { type RecordPageLayout } from "@/components/record-page/layout";

import type { ProjectRecordFormValues } from "./project-record-schema";

export const projectRecordLayout: RecordPageLayout<ProjectRecordFormValues> = {
  header: {
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
          description: "Project overview details.",
          fields: [{ id: "name", label: "Name", type: "text" }],
          id: "project-details",
          title: "Project details",
        },
      ],
    },
    firstColumn: { sections: [] },
    secondColumn: { sections: [] },
  },
};
