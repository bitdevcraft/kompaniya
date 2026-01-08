import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Real Estate Bookings (org_real_estate_bookings)
 */
export const orgRealEstateBookingsFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Booking reference",
    type: "text",
    category: "identity",
    group: "Booking Info",
    sortOrder: 1,
  },
  {
    id: "propertyId",
    label: "Property",
    type: "text",
    category: "organization",
    group: "Booking Details",
    sortOrder: 1,
  },
  {
    id: "customerId",
    label: "Customer",
    type: "text",
    category: "contact",
    group: "Booking Details",
    sortOrder: 2,
  },
  {
    id: "checkInDate",
    label: "Check-in date",
    type: "date",
    category: "activity",
    group: "Dates",
    sortOrder: 1,
  },
  {
    id: "checkOutDate",
    label: "Check-out date",
    type: "date",
    category: "activity",
    group: "Dates",
    sortOrder: 2,
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    category: "metadata",
    group: "Booking Status",
    sortOrder: 1,
  },
  {
    id: "totalAmount",
    label: "Total amount",
    type: "number",
    category: "metadata",
    group: "Pricing",
    sortOrder: 1,
  },
];
