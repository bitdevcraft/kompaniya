import { FieldOption as RecordFieldOption } from "@repo/domain";

import { RecordPageLayout } from "@/components/record-page/layout";
import { env } from "@/env/client";

import type { BookingRecordFormValues } from "./booking-record-schema";

const BOOKING_TYPE_OPTIONS: RecordFieldOption[] = [
  { label: "Sale", value: "sale" },
  { label: "Rent", value: "rent" },
];

const STATUS_OPTIONS: RecordFieldOption[] = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

export const bookingRecordLayout: RecordPageLayout<BookingRecordFormValues> = {
  header: {
    chips: [
      {
        fieldId: "referenceCode",
        id: "reference-code-chip",
      },
    ],
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
          description: "Basic booking information.",
          fields: [
            { id: "name", label: "Name", type: "text" },
            {
              id: "referenceCode",
              label: "Reference Code",
              type: "text",
            },
            {
              description: "The type of booking (sale or rent).",
              id: "bookingType",
              label: "Booking Type",
              options: BOOKING_TYPE_OPTIONS,
              type: "picklist",
            },
            {
              description: "Current status of the booking.",
              id: "status",
              label: "Status",
              options: STATUS_OPTIONS,
              type: "picklist",
            },
          ],
          id: "booking-details",
          title: "Booking Details",
        },
        {
          description: "Associated project and property.",
          fields: [
            {
              id: "projectId",
              label: "Project",
              reference: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-project/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-project/r/:id`,
              },
              type: "reference",
            },
            {
              id: "propertyId",
              label: "Property",
              reference: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-property/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-property/r/:id`,
              },
              type: "reference",
            },
          ],
          id: "booking-associations",
          title: "Associations",
        },
        {
          columns: 2,
          description: "Financial details for the booking.",
          fields: [
            { id: "amount", label: "Amount", type: "number" },
            { id: "depositAmount", label: "Deposit Amount", type: "number" },
            { id: "currencyCode", label: "Currency Code", type: "text" },
          ],
          id: "booking-financials",
          title: "Financial Details",
        },
        {
          description: "Important dates for the booking.",
          fields: [
            {
              id: "expectedCompletionAt",
              label: "Expected Completion Date",
              type: "datetime",
            },
            {
              id: "contractSignedAt",
              label: "Contract Signed Date",
              type: "datetime",
            },
          ],
          id: "booking-dates",
          title: "Important Dates",
        },
      ],
    },
    firstColumn: { sections: [] },
    secondColumn: {
      sections: [
        {
          description: "Additional notes and information.",
          fields: [
            {
              id: "notes",
              label: "Notes",
              type: "textarea",
            },
          ],
          id: "booking-notes",
          title: "Notes",
        },
      ],
    },
  },
};
