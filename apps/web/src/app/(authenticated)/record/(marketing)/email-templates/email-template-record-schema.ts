import type { OrgEmailTemplate } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const emailTemplateRecordSchema = z.object({
  body: z.string().optional(),
  createdAt: z.string().optional(),
  htmlContent: z.string().optional(),
  mjmlContent: z.string().optional(),
  mjmlJsonContent: z.string().optional(),
  name: z.string().optional(),
  subject: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type EmailTemplateRecordFormValues = z.input<
  typeof emailTemplateRecordSchema
>;
export type EmailTemplateRecordSubmitValues = z.output<
  typeof emailTemplateRecordSchema
>;

export function createEmailTemplateFormDefaults(
  record: OrgEmailTemplate,
  layout: RecordPageLayout<EmailTemplateRecordFormValues>,
): EmailTemplateRecordFormValues {
  const defaults: Partial<EmailTemplateRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] =
      normalized as EmailTemplateRecordFormValues[typeof field.id];
  }

  return defaults as EmailTemplateRecordFormValues;
}

export function createEmailTemplateUpdatePayload(
  record: OrgEmailTemplate,
  values: EmailTemplateRecordSubmitValues,
  layout: RecordPageLayout<EmailTemplateRecordFormValues>,
): Partial<OrgEmailTemplate> {
  const updates: Partial<OrgEmailTemplate> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];
    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgEmailTemplate] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgEmailTemplate[keyof OrgEmailTemplate];
  }

  return {
    ...updates,
    id: record.id,
  };
}
