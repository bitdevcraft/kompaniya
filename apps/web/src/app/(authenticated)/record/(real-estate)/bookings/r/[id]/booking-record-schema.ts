import type { OrgRealEstateBooking } from "@repo/database/schema";

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

export const bookingRecordSchema = z.object({
  amount: z.string().optional(),
  bookingType: z.string().optional(),
  contractSignedAt: z.string().optional(),
  createdAt: z.string().optional(),
  currencyCode: z.string().optional(),
  depositAmount: z.string().optional(),
  expectedCompletionAt: z.string().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
  propertyId: z.string().optional(),
  projectId: z.string().optional(),
  referenceCode: z.string().optional(),
  status: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type BookingRecordFormValues = z.input<typeof bookingRecordSchema>;
export type BookingRecordSubmitValues = z.output<typeof bookingRecordSchema>;

export function createBookingFormDefaults(
  record: OrgRealEstateBooking,
  layout: RecordPageLayout<BookingRecordFormValues>,
): BookingRecordFormValues {
  const defaults: Record<string, unknown> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = getValueAtPath(
      record as Record<string, unknown>,
      field.id as string,
    );
    const normalized = normalizeValueForForm(field, value);
    setValueAtPath(defaults, field.id as string, normalized);
  }

  return defaults as BookingRecordFormValues;
}

export function createBookingUpdatePayload(
  record: OrgRealEstateBooking,
  values: BookingRecordSubmitValues,
  layout: RecordPageLayout<BookingRecordFormValues>,
): Partial<OrgRealEstateBooking> {
  const updates: Partial<OrgRealEstateBooking> = {};
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
