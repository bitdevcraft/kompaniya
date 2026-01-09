import { type RecordPageLayout } from "@/components/record-page/layout";

export const bookingBuyersRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "buyer-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "buyer-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled buyer",
      fieldId: "contactId",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Buyer association details for real estate bookings.",
          fields: [
            {
              id: "bookingId",
              label: "Booking ID",
              type: "text",
            },
            {
              id: "contactId",
              label: "Contact ID",
              type: "text",
            },
          ],
          id: "buyer-details",
          title: "Buyer details",
        },
        {
          description: "Primary buyer designation.",
          fields: [
            {
              id: "isPrimaryBuyer",
              label: "Primary buyer",
              type: "boolean",
            },
          ],
          id: "buyer-status",
          title: "Status",
        },
      ],
    },
  },
};
