import { FieldOption as RecordFieldOption } from "@repo/domain";

import { RecordPageLayout } from "@/components/record-page/layout";
import { env } from "@/env/client";

import type { PropertyRecordFormValues } from "./property-record-schema";

const PROPERTY_TYPE_OPTIONS: RecordFieldOption[] = [
  { label: "Unit", value: "unit" },
  { label: "Plot", value: "plot" },
  { label: "Villa", value: "villa" },
  { label: "Apartment", value: "apartment" },
  { label: "Other", value: "other" },
];

const LISTING_TYPE_OPTIONS: RecordFieldOption[] = [
  { label: "Sale", value: "sale" },
  { label: "Rent", value: "rent" },
];

const STATUS_OPTIONS: RecordFieldOption[] = [
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Sold", value: "sold" },
  { label: "Rented", value: "rented" },
  { label: "Inactive", value: "inactive" },
];

export const propertyRecordLayout: RecordPageLayout<PropertyRecordFormValues> =
  {
    header: {
      chips: [
        {
          fieldId: "propertyCode",
          id: "property-code-chip",
        },
      ],
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
            description: "Basic property information.",
            fields: [
              { id: "name", label: "Name", type: "text" },
              {
                id: "propertyCode",
                label: "Property Code",
                type: "text",
              },
              {
                description:
                  "The type of property (e.g., unit, plot, villa, apartment).",
                id: "propertyType",
                label: "Property Type",
                options: PROPERTY_TYPE_OPTIONS,
                type: "picklist",
              },
              {
                description: "Whether this property is for sale or rent.",
                id: "listingType",
                label: "Listing Type",
                options: LISTING_TYPE_OPTIONS,
                type: "picklist",
              },
              {
                description: "Current availability status of the property.",
                id: "status",
                label: "Status",
                options: STATUS_OPTIONS,
                type: "picklist",
              },
              {
                id: "projectId",
                label: "Project",
                reference: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-project/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-project/r/:id`,
                },
                type: "reference",
              },
            ],
            id: "property-details",
            title: "Property Details",
          },
          {
            columns: 2,
            description: "Physical characteristics of the property.",
            fields: [
              { id: "bedrooms", label: "Bedrooms", type: "number" },
              { id: "bathrooms", label: "Bathrooms", type: "number" },
              { id: "floor", label: "Floor", type: "text" },
              { id: "area", label: "Area", type: "number" },
              { id: "areaUnit", label: "Area Unit", type: "text" },
              { id: "parkingSpots", label: "Parking Spots", type: "number" },
              {
                id: "isFurnished",
                label: "Is Furnished",
                type: "boolean",
              },
            ],
            id: "property-specs",
            title: "Property Specifications",
          },
          {
            columns: 2,
            description: "Property location information.",
            fields: [
              { id: "addressLine1", label: "Address Line 1", type: "text" },
              { id: "addressLine2", label: "Address Line 2", type: "text" },
              { id: "city", label: "City", type: "text" },
              { id: "state", label: "State", type: "text" },
              { id: "country", label: "Country", type: "text" },
              { id: "postalCode", label: "Postal Code", type: "text" },
            ],
            id: "property-address",
            title: "Address",
          },
          {
            description: "Pricing and financial information.",
            fields: [
              { id: "askingPrice", label: "Asking Price", type: "number" },
              { id: "askingRent", label: "Asking Rent", type: "number" },
              { id: "currencyCode", label: "Currency Code", type: "text" },
            ],
            id: "property-pricing",
            title: "Pricing",
          },
        ],
      },
      firstColumn: { sections: [] },
      secondColumn: {
        sections: [
          {
            description: "Additional details about the property.",
            fields: [
              {
                id: "description",
                label: "Description",
                type: "textarea",
              },
            ],
            id: "property-description",
            title: "Description",
          },
        ],
      },
    },
  };
