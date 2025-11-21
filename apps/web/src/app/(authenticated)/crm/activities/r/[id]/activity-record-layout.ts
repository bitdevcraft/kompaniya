import { type RecordPageLayout } from "@/components/record-page/layout";

import type { ActivityRecordFormValues } from "./activity-record-schema";

export const activityRecordLayout: RecordPageLayout<ActivityRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "activity-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "activity-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      title: {
        fallback: "Untitled activity",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Core activity attributes captured in your CRM.",
            fields: [
              { id: "name", label: "Name", type: "text" },
              { id: "ownerId", label: "Owner ID", type: "text" },
              { id: "createdBy", label: "Created by", type: "text" },
              { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
            ],
            id: "activity-details",
            title: "Activity details",
          },
        ],
      },
      firstColumn: { sections: [] },
      secondColumn: { sections: [] },
    },
  };
