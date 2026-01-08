import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Real Estate Properties (org_real_estate_properties)
 */
export const orgRealEstatePropertiesFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Property name",
    type: "text",
    category: "identity",
    group: "Property Info",
    sortOrder: 1,
  },
  {
    id: "propertyType",
    label: "Property type",
    type: "text",
    category: "metadata",
    group: "Details",
    sortOrder: 1,
  },
  {
    id: "address",
    label: "Address",
    type: "text",
    category: "address",
    group: "Location",
    sortOrder: 1,
  },
  {
    id: "city",
    label: "City",
    type: "text",
    category: "address",
    group: "Location",
    sortOrder: 2,
  },
  {
    id: "price",
    label: "Price",
    type: "number",
    category: "metadata",
    group: "Pricing",
    sortOrder: 1,
  },
  {
    id: "bedrooms",
    label: "Bedrooms",
    type: "number",
    category: "metadata",
    group: "Details",
    sortOrder: 2,
  },
  {
    id: "bathrooms",
    label: "Bathrooms",
    type: "number",
    category: "metadata",
    group: "Details",
    sortOrder: 3,
  },
  {
    id: "area",
    label: "Area (sq ft)",
    type: "number",
    category: "metadata",
    group: "Details",
    sortOrder: 4,
  },
];
