import type { OrgContact } from "@repo/database/schema";

import { z } from "zod";

import { RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  getValueAtPath,
  normalizeValueForForm,
  normalizeValueForSubmission,
  setValueAtPath,
} from "@/components/record-page/layout-helpers";

const CUSTOM_FIELDS_PREFIX = "customFields.";

export const contactRecordSchema = z.object({
  annualRevenueBand: z.string().optional(),
  avatarUrl: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingCountryCode: z.string().optional(),
  billingLatitude: z.string().optional(),
  billingLongitude: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingRegion: z.string().optional(),
  birthday: z.string().optional(),
  categories: z.array(z.string()).optional().default([]),
  companyName: z.string().optional(),
  consentCapturedAt: z.string().optional(),
  consentIp: z.string().optional(),
  consentSource: z.string().optional(),
  createdAt: z.string().optional(),
  dedupeKey: z.string().optional(),
  doNotContact: z.boolean().default(false),
  doNotSell: z.boolean().default(false),
  email: z.string().optional(),
  emailConfirmedAt: z.string().optional(),
  emailOptIn: z.boolean().default(false),
  employeeCountBand: z.string().optional(),
  gdprConsentScope: z.string().optional(),
  industry: z.string().optional(),
  languagePref: z.string().optional(),
  lastActivityAt: z.string().optional(),
  linkedinUrl: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationality: z.string().optional(),
  nextActivityAt: z.string().optional(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  phoneOptIn: z.boolean().default(false),
  salutation: z.string().optional(),
  score: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingCountryCode: z.string().optional(),
  shippingLatitude: z.string().optional(),
  shippingLongitude: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingRegion: z.string().optional(),
  smsOptIn: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
  twitterHandle: z.string().optional(),
  updatedAt: z.string().optional(),
  websiteUrl: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type ContactRecordFormValues = z.input<typeof contactRecordSchema>;
export type ContactRecordSubmitValues = z.output<typeof contactRecordSchema>;

export function createContactFormDefaults(
  record: OrgContact,
  layout: RecordPageLayout<ContactRecordFormValues>,
): ContactRecordFormValues {
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

  return defaults as ContactRecordFormValues;
}

export function createContactUpdatePayload(
  record: OrgContact,
  values: ContactRecordSubmitValues,
  layout: RecordPageLayout<ContactRecordFormValues>,
): Partial<OrgContact> {
  const updates: Partial<OrgContact> = {};
  const customFieldUpdates: Record<string, unknown> = {};
  const editable = getEditableLayoutFields(layout);

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
