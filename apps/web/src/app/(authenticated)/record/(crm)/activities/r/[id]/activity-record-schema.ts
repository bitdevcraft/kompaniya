import type { OrgActivity } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const activityRecordSchema = z.object({
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  lastUpdatedBy: z.string().optional(),
  name: z.string().optional(),
  ownerId: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ActivityRecordFormValues = z.input<typeof activityRecordSchema>;
export type ActivityRecordSubmitValues = z.output<typeof activityRecordSchema>;

export function createActivityFormDefaults(
  record: OrgActivity,
  layout: RecordPageLayout<ActivityRecordFormValues>,
): ActivityRecordFormValues {
  const defaults: Partial<ActivityRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] =
      normalized as ActivityRecordFormValues[typeof field.id];
  }

  return defaults as ActivityRecordFormValues;
}

export function createActivityUpdatePayload(
  record: OrgActivity,
  values: ActivityRecordSubmitValues,
  layout: RecordPageLayout<ActivityRecordFormValues>,
): Partial<OrgActivity> {
  const updates: Partial<OrgActivity> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];
    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgActivity] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgActivity[keyof OrgActivity];
  }

  return {
    ...updates,
    id: record.id,
  };
}
