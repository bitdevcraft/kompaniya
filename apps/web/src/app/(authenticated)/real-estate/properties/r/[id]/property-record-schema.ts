import type { OrgRealEstateProperty } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const propertyRecordSchema = z.object({
  createdAt: z.string().optional(),
  name: z.string().optional(),
  projectId: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PropertyRecordFormValues = z.input<typeof propertyRecordSchema>;
export type PropertyRecordSubmitValues = z.output<typeof propertyRecordSchema>;

export function createPropertyFormDefaults(
  record: OrgRealEstateProperty,
  layout: RecordPageLayout<PropertyRecordFormValues>,
): PropertyRecordFormValues {
  const defaults: Partial<PropertyRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] =
      normalized as PropertyRecordFormValues[typeof field.id];
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
    const value = values[field.id];
    updates[field.id as keyof OrgRealEstateProperty] =
      normalizeValueForSubmission(
        field,
        value,
      ) as OrgRealEstateProperty[keyof OrgRealEstateProperty];
  }

  return {
    ...updates,
    id: record.id,
  };
}
