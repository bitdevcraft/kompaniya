import type { OrgRealEstateProperty } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  getValueAtPath,
  normalizeValueForForm,
  normalizeValueForSubmission,
  setValueAtPath,
} from "@/components/record-page/layout-helpers";

export const propertyRecordSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  area: z.string().optional(),
  areaUnit: z.string().optional(),
  askingPrice: z.string().optional(),
  askingRent: z.string().optional(),
  bathrooms: z.string().optional(),
  bedrooms: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  createdAt: z.string().optional(),
  currencyCode: z.string().optional(),
  description: z.string().optional(),
  floor: z.string().optional(),
  isFurnished: z.boolean().default(false),
  listingType: z.string().optional(),
  name: z.string().optional(),
  parkingSpots: z.string().optional(),
  postalCode: z.string().optional(),
  propertyCode: z.string().optional(),
  propertyType: z.string().optional(),
  projectId: z.string().optional(),
  state: z.string().optional(),
  status: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PropertyRecordFormValues = z.input<typeof propertyRecordSchema>;
export type PropertyRecordSubmitValues = z.output<typeof propertyRecordSchema>;

export function createPropertyFormDefaults(
  record: OrgRealEstateProperty,
  layout: RecordPageLayout<PropertyRecordFormValues>,
): PropertyRecordFormValues {
  const defaults: Record<string, unknown> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = getValueAtPath(
      record as Record<string, unknown>,
      field.id as string,
    );
    const normalized = normalizeValueForForm(field, value);
    setValueAtPath(defaults, field.id as string, normalized);
  }

  return defaults as PropertyRecordFormValues;
}

export function createPropertyUpdatePayload(
  record: OrgRealEstateProperty,
  values: PropertyRecordSubmitValues,
  layout: RecordPageLayout<PropertyRecordFormValues>,
): Partial<OrgRealEstateProperty> {
  const updates: Partial<OrgRealEstateProperty> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const fieldId = field.id as string;
    const value = getValueAtPath(values as Record<string, unknown>, fieldId);
    const normalized = normalizeValueForSubmission(field, value);
    (updates as Record<string, unknown>)[fieldId] = normalized;
  }

  return {
    ...updates,
    id: record.id,
  };
}
