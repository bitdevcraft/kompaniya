import type { OrgContact } from "@repo/database/schema";

import { z } from "zod";

import { RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

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
});

export type ContactRecordFormValues = z.input<typeof contactRecordSchema>;
export type ContactRecordSubmitValues = z.output<typeof contactRecordSchema>;

export function createContactFormDefaults(
  record: OrgContact,
  layout: RecordPageLayout<ContactRecordFormValues>,
): ContactRecordFormValues {
  const defaults: Partial<ContactRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);
    if (field.type === "multipicklist" && normalized === "") {
      // @ts-expect-error todo fix-types
      defaults[field.id] = [] as ContactRecordFormValues[typeof field.id];
      continue;
    }
    // @ts-expect-error todo fix-types
    defaults[field.id] = normalized as ContactRecordFormValues[typeof field.id];
  }

  return defaults as ContactRecordFormValues;
}

export function createContactUpdatePayload(
  record: OrgContact,
  values: ContactRecordSubmitValues,
  layout: RecordPageLayout<ContactRecordFormValues>,
): Partial<OrgContact> {
  const updates: Partial<OrgContact> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    // @ts-expect-error todo fix-types
    const value = values[field.id];
    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgContact] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgContact[keyof OrgContact];
  }

  return {
    ...updates,
    id: record.id,
  };
}
