/**
 * Default record layout for org_real_estate_properties
 */

import {
  REAL_ESTATE_LISTING_TYPES,
  REAL_ESTATE_PROPERTY_STATUS,
  REAL_ESTATE_PROPERTY_TYPES,
} from "./constants";

export const orgRealEstatePropertiesLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled property" },
    metadata: [
      {
        fieldId: "status",
        id: "property-status",
        label: "Status",
      },
      {
        fieldId: "propertyType",
        id: "property-type",
        label: "Type",
      },
      {
        fieldId: "askingPrice",
        id: "property-price",
        label: "Price",
      },
    ],
    subtitle: [
      { fieldId: "propertyCode", prefix: "Code: " },
      { fieldId: "projectId", prefix: "Project: " },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Properties are individual real estate units within projects.",
          fields: [
            { id: "name", label: "Property name", type: "text" },
            {
              id: "propertyCode",
              label: "Property code",
              type: "text",
            },
            {
              id: "description",
              label: "Description",
              type: "textarea",
            },
            {
              id: "propertyType",
              label: "Property type",
              type: "picklist",
              options: REAL_ESTATE_PROPERTY_TYPES,
            },
            {
              id: "listingType",
              label: "Listing type",
              type: "picklist",
              options: REAL_ESTATE_LISTING_TYPES,
            },
            {
              id: "status",
              label: "Status",
              type: "picklist",
              options: REAL_ESTATE_PROPERTY_STATUS,
            },
          ],
          id: "property-details",
          title: "Property details",
        },
        {
          columns: 3,
          description: "Physical specifications of the property.",
          fields: [
            {
              id: "bedrooms",
              label: "Bedrooms",
              type: "number",
            },
            {
              id: "bathrooms",
              label: "Bathrooms",
              type: "number",
            },
            {
              id: "floor",
              label: "Floor",
              type: "text",
            },
            {
              id: "area",
              label: "Area",
              type: "number",
            },
            {
              id: "areaUnit",
              label: "Area unit",
              type: "text",
            },
            {
              id: "isFurnished",
              label: "Furnished",
              type: "boolean",
            },
            {
              id: "parkingSpots",
              label: "Parking spots",
              type: "number",
            },
          ],
          id: "property-specs",
          title: "Specifications",
        },
        {
          description: "Pricing information for sale or rent.",
          columns: 2,
          fields: [
            {
              id: "askingPrice",
              label: "Asking price",
              type: "number",
            },
            {
              id: "askingRent",
              label: "Asking rent",
              type: "number",
            },
            {
              id: "currencyCode",
              label: "Currency",
              type: "text",
            },
          ],
          id: "property-pricing",
          title: "Pricing",
        },
        {
          columns: 2,
          description: "Property location address.",
          fields: [
            {
              id: "addressLine1",
              label: "Address line 1",
              type: "text",
            },
            {
              id: "addressLine2",
              label: "Address line 2",
              type: "text",
            },
            { id: "city", label: "City", type: "text" },
            { id: "state", label: "State / region", type: "text" },
            { id: "country", label: "Country", type: "text" },
            { id: "postalCode", label: "Postal code", type: "text" },
          ],
          id: "property-location",
          title: "Location",
        },
        {
          description: "Associated project.",
          fields: [
            {
              id: "projectId",
              label: "Project ID",
              type: "text",
            },
          ],
          id: "property-project",
          title: "Project",
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
          id: "property-tracking",
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
          id: "property-custom",
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
