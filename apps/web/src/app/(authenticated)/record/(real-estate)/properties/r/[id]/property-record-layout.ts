import { type RecordPageLayout } from "@/components/record-page/layout";

import type { PropertyRecordFormValues } from "./property-record-schema";

export const propertyRecordLayout: RecordPageLayout<PropertyRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "property-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "property-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      title: {
        fallback: "Untitled property",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Property details and associations.",
            fields: [
              { id: "name", label: "Name", type: "text" },
              { id: "projectId", label: "Project ID", type: "text" },
            ],
            id: "property-details",
            title: "Property details",
          },
        ],
      },
      firstColumn: { sections: [] },
      secondColumn: { sections: [] },
    },
  };
