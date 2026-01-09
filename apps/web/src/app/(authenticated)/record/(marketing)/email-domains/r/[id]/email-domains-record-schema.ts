import type { OrgEmailDomain } from "@repo/database/schema";

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

export const emailDomainRecordSchema = z.object({
  name: z.string().optional(),
  verified: z.boolean().optional(),
  dkimStatus: z.string().optional(),
  spfStatus: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type EmailDomainRecordFormValues = z.input<
  typeof emailDomainRecordSchema
>;
export type EmailDomainRecordSubmitValues = z.output<
  typeof emailDomainRecordSchema
>;

export function createEmailDomainFormDefaults(
  record: OrgEmailDomain,
  layout: RecordPageLayout<EmailDomainRecordFormValues>,
): EmailDomainRecordFormValues {
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

  return defaults as EmailDomainRecordFormValues;
}

export function createEmailDomainUpdatePayload(
  record: OrgEmailDomain,
  values: EmailDomainRecordSubmitValues,
  layout: RecordPageLayout<EmailDomainRecordFormValues>,
): Partial<OrgEmailDomain> {
  const updates: Partial<OrgEmailDomain> = {};
  const customFieldUpdates: Record<string, unknown> = {};
  const editable = getEditableLayoutFields(layout);

  const CUSTOM_FIELDS_PREFIX = "customFields.";

  for (const field of editable) {
    const fieldId = field.id as string;
    const value = getValueAtPath(values as Record<string, unknown>, fieldId);
    const normalized = normalizeValueForSubmission(field, value);

    if (fieldId.startsWith(CUSTOM_FIELDS_PREFIX)) {
      const customKey = fieldId.slice(CUSTOM_FIELDS_PREFIX.length);
      if (customKey) {
        customFieldUpdates[customKey] = normalized;
      }
      continue;
    }

    (updates as Record<string, unknown>)[fieldId] = normalized;
  }

  if (Object.keys(customFieldUpdates).length > 0) {
    const existingCustomFields = isRecord(record.customFields)
      ? record.customFields
      : {};
    updates.customFields = {
      ...existingCustomFields,
      ...customFieldUpdates,
    };
  }

  return {
    ...updates,
    id: record.id,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
