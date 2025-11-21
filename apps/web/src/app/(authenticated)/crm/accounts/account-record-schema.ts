import type { OrgAccount } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const accountRecordSchema = z.object({
  annualRevenueBand: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingCountryCode: z.string().optional(),
  billingLatitude: z.string().optional(),
  billingLongitude: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingRegion: z.string().optional(),
  categories: z.array(z.string()).optional().default([]),
  companyName: z.string().optional(),
  createdAt: z.string().optional(),
  email: z.string().optional(),
  employeeCountBand: z.string().optional(),
  industry: z.string().optional(),
  lastActivityAt: z.string().optional(),
  linkedinUrl: z.string().optional(),
  name: z.string().optional(),
  nextActivityAt: z.string().optional(),
  notes: z.string().optional(),
  phone: z.string().optional(),
  score: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingCountryCode: z.string().optional(),
  shippingLatitude: z.string().optional(),
  shippingLongitude: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingRegion: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  twitterHandle: z.string().optional(),
  updatedAt: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export type AccountRecordFormValues = z.input<typeof accountRecordSchema>;
export type AccountRecordSubmitValues = z.output<typeof accountRecordSchema>;

export function createAccountFormDefaults(
  record: OrgAccount,
  layout: RecordPageLayout<AccountRecordFormValues>,
): AccountRecordFormValues {
  const defaults: Partial<AccountRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    if (field.type === "multipicklist" && normalized === "") {
      // @ts-expect-error todo fix-types
      defaults[field.id] = [] as AccountRecordFormValues[typeof field.id];
      continue;
    }

    // @ts-expect-error todo fix-types
    defaults[field.id] = normalized as AccountRecordFormValues[typeof field.id];
  }

  return defaults as AccountRecordFormValues;
}

export function createAccountUpdatePayload(
  record: OrgAccount,
  values: AccountRecordSubmitValues,
  layout: RecordPageLayout<AccountRecordFormValues>,
): Partial<OrgAccount> {
  const updates: Partial<OrgAccount> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    // @ts-expect-error todo fix-types
    const value = values[field.id];
    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgAccount] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgAccount[keyof OrgAccount];
  }

  return {
    ...updates,
    id: record.id,
  };
}
