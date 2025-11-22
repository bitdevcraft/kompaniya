import { type RecordPageLayout } from "@/components/record-page/layout";

import type { BookingRecordFormValues } from "./booking-record-schema";

export const bookingRecordLayout: RecordPageLayout<BookingRecordFormValues> = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "booking-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "booking-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled booking",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Key booking details for this record.",
          fields: [
            { id: "name", label: "Name", type: "text" },
            { id: "projectId", label: "Project ID", type: "text" },
            { id: "propertyId", label: "Property ID", type: "text" },
          ],
          id: "booking-details",
          title: "Booking details",
        },
      ],
    },
    firstColumn: { sections: [] },
    secondColumn: { sections: [] },
  },
};
