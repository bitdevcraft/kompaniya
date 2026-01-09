import type { OrgTag } from "@repo/database/schema";

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

export const tagRecordSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TagRecordFormValues = z.input<typeof tagRecordSchema>;
export type TagRecordSubmitValues = z.output<typeof tagRecordSchema>;

export function createTagFormDefaults(
  record: OrgTag,
  layout: RecordPageLayout<TagRecordFormValues>,
): TagRecordFormValues {
  const defaults: Record<string, unknown> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = getValueAtPath(
      record as Record<string, unknown>,
      field.id as string,
    );
    const normalized = normalizeValueForForm(field, value);
    if (field.type === "multipicklist" && normalized === "") {
      setValueAtPath(defaults, field.id as string, []);
      continue;
    }
    setValueAtPath(defaults, field.id as string, normalized);
  }

  return defaults as TagRecordFormValues;
}

export function createTagUpdatePayload(
  record: OrgTag,
  values: TagRecordSubmitValues,
  layout: RecordPageLayout<TagRecordFormValues>,
): Partial<OrgTag> {
  const updates: Partial<OrgTag> = {};
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
