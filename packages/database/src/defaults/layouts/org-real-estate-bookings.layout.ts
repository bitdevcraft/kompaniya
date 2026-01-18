/**
 * Default record layout for org_real_estate_bookings
 */

import {
  REAL_ESTATE_BOOKING_STATUS,
  REAL_ESTATE_BOOKING_TYPES,
} from "./constants";

export const orgRealEstateBookingsLayout = {
  header: {
    title: { fieldId: "referenceCode", fallback: "Untitled booking" },
    metadata: [
      {
        fieldId: "status",
        id: "booking-status",
        label: "Status",
      },
      {
        fieldId: "bookingType",
        id: "booking-type",
        label: "Type",
      },
      {
        fieldId: "amount",
        id: "booking-amount",
        label: "Amount",
      },
    ],
    subtitle: [
      { fieldId: "name", prefix: "Client: " },
      { fieldId: "propertyId", prefix: "Property: " },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Bookings represent reservations or sales agreements for properties.",
          fields: [
            { id: "name", label: "Client name", type: "text" },
            {
              id: "referenceCode",
              label: "Reference code",
              type: "text",
            },
            {
              id: "bookingType",
              label: "Booking type",
              type: "picklist",
              options: REAL_ESTATE_BOOKING_TYPES,
            },
            {
              id: "status",
              label: "Status",
              type: "picklist",
              options: REAL_ESTATE_BOOKING_STATUS,
            },
          ],
          id: "booking-details",
          title: "Booking details",
        },
        {
          description: "Financial details for this booking.",
          columns: 2,
          fields: [
            {
              id: "amount",
              label: "Amount",
              type: "number",
            },
            {
              id: "depositAmount",
              label: "Deposit amount",
              type: "number",
            },
            {
              id: "currencyCode",
              label: "Currency",
              type: "text",
            },
          ],
          id: "booking-financial",
          title: "Financial",
        },
        {
          description: "Associated records for this booking.",
          fields: [
            {
              id: "projectId",
              label: "Project ID",
              type: "text",
            },
            {
              id: "propertyId",
              label: "Property ID",
              type: "text",
            },
            {
              id: "paymentPlanId",
              label: "Payment plan ID",
              type: "text",
            },
          ],
          id: "booking-relations",
          title: "Related records",
        },
        {
          description: "Important dates and milestones.",
          columns: 2,
          fields: [
            {
              id: "expectedCompletionAt",
              label: "Expected completion",
              type: "datetime",
            },
            {
              id: "contractSignedAt",
              label: "Contract signed",
              type: "datetime",
            },
          ],
          id: "booking-timeline",
          title: "Timeline",
        },
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
    firstColumn: {
      sections: [
        {
          description: "Owner and tracking information.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "booking-tracking",
          title: "Tracking",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Custom fields configured for your organization.",
          fields: [
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "booking-custom",
          title: "Custom fields",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    { id: "deletedAt", label: "Deleted", readOnly: true, type: "datetime" },
  ],
};
