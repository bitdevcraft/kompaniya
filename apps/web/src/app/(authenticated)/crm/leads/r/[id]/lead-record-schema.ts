import type { OrgLead } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const leadRecordSchema = z.object({
  categories: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional(),
  lastActivityAt: z.string().optional(),
  name: z.string().optional(),
  nationality: z.string().optional(),
  nextActivityAt: z.string().optional(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  salutation: z.string().optional(),
  score: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  updatedAt: z.string().optional(),
  email: z.string().optional(),
});

export type LeadRecordFormValues = z.input<typeof leadRecordSchema>;
export type LeadRecordSubmitValues = z.output<typeof leadRecordSchema>;

export function createLeadFormDefaults(
  record: OrgLead,
  layout: RecordPageLayout<LeadRecordFormValues>,
): LeadRecordFormValues {
  const defaults: Partial<LeadRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);
    if (field.type === "multipicklist" && normalized === "") {
      defaults[field.id] = [] as LeadRecordFormValues[typeof field.id];
      continue;
    }
    defaults[field.id] = normalized as LeadRecordFormValues[typeof field.id];
  }

  return defaults as LeadRecordFormValues;
}

export function createLeadUpdatePayload(
  record: OrgLead,
  values: LeadRecordSubmitValues,
  layout: RecordPageLayout<LeadRecordFormValues>,
): Partial<OrgLead> {
  const updates: Partial<OrgLead> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];
    updates[field.id as keyof OrgLead] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgLead[keyof OrgLead];
  }

  return {
    ...updates,
    id: record.id,
  };
}
