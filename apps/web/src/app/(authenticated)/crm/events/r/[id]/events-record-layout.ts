import { type RecordPageLayout } from "@/components/record-page/layout";

export const eventsRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "event-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "event-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled event",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Core event attributes and scheduling details.",
          fields: [
            { id: "name", label: "Event name", type: "text" },
            { id: "description", label: "Description", type: "textarea" },
          ],
          id: "event-details",
          title: "Event details",
        },
        {
          description: "Event timing and location information.",
          fields: [
            { id: "startDate", label: "Start date", type: "datetime" },
            { id: "endDate", label: "End date", type: "datetime" },
            { id: "location", label: "Location", type: "text" },
          ],
          id: "event-scheduling",
          title: "Scheduling",
        },
      ],
    },
  },
};
