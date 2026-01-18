/**
 * Default record layout for org_real_estate_booking_buyers
 */

export const orgRealEstateBookingBuyersLayout = {
  header: {
    title: { fieldId: "contactId", fallback: "Buyer" },
    metadata: [
      {
        fieldId: "isPrimaryBuyer",
        id: "buyer-primary",
        label: "Primary buyer",
      },
      {
        fieldId: "bookingId",
        id: "buyer-booking",
        label: "Booking ID",
      },
      {
        fieldId: "createdAt",
        id: "buyer-created",
        label: "Added",
        type: "datetime",
      },
    ],
    subtitle: [{ fieldId: "contactId", prefix: "Contact: " }],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Booking buyers link contacts to real estate bookings, representing the purchasers.",
          fields: [
            {
              id: "contactId",
              label: "Contact ID",
              type: "text",
              description: "The contact person who is the buyer",
            },
            {
              id: "bookingId",
              label: "Booking ID",
              type: "text",
              description: "The booking this buyer is associated with",
            },
            {
              id: "isPrimaryBuyer",
              label: "Is primary buyer",
              type: "boolean",
              description: "Whether this is the primary buyer for the booking",
            },
          ],
          id: "buyer-details",
          title: "Buyer details",
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
          id: "buyer-tracking",
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
          id: "buyer-custom",
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
