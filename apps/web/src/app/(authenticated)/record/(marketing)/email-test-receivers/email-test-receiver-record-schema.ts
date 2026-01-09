import type { OrgEmailTestReceiver } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const emailTestReceiverRecordSchema = z.object({
  createdAt: z.string().optional(),
  emails: z.string().optional(),
  name: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type EmailTestReceiverRecordFormValues = z.input<
  typeof emailTestReceiverRecordSchema
>;
export type EmailTestReceiverRecordSubmitValues = z.output<
  typeof emailTestReceiverRecordSchema
>;

export function createEmailTestReceiverFormDefaults(
  record: OrgEmailTestReceiver,
  layout: RecordPageLayout<EmailTestReceiverRecordFormValues>,
): EmailTestReceiverRecordFormValues {
  const defaults: Partial<EmailTestReceiverRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];

    if (field.id === "emails" && Array.isArray(value)) {
      defaults[field.id] = value.join("\n");
      continue;
    }

    const normalized = normalizeValueForForm(field, value);
    defaults[field.id] =
      normalized as EmailTestReceiverRecordFormValues[typeof field.id];
  }

  return defaults as EmailTestReceiverRecordFormValues;
}

export function createEmailTestReceiverUpdatePayload(
  record: OrgEmailTestReceiver,
  values: EmailTestReceiverRecordSubmitValues,
  layout: RecordPageLayout<EmailTestReceiverRecordFormValues>,
): Partial<OrgEmailTestReceiver> {
  const updates: Partial<OrgEmailTestReceiver> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];

    if (field.id === "emails") {
      updates.emails = normalizeEmails(value);
      continue;
    }

    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgEmailTestReceiver] =
      normalizeValueForSubmission(
        field,
        value,
      ) as OrgEmailTestReceiver[keyof OrgEmailTestReceiver];
  }

  return {
    ...updates,
    id: record.id,
  };
}

function normalizeEmails(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}
