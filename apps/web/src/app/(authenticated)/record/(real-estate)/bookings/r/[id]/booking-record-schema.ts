import type { OrgRealEstateBooking } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const bookingRecordSchema = z.object({
  createdAt: z.string().optional(),
  name: z.string().optional(),
  projectId: z.string().optional(),
  propertyId: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type BookingRecordFormValues = z.input<typeof bookingRecordSchema>;
export type BookingRecordSubmitValues = z.output<typeof bookingRecordSchema>;

export function createBookingFormDefaults(
  record: OrgRealEstateBooking,
  layout: RecordPageLayout<BookingRecordFormValues>,
): BookingRecordFormValues {
  const defaults: Partial<BookingRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] = normalized as BookingRecordFormValues[typeof field.id];
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
    const value = values[field.id];
    // @ts-expect-error type
    updates[field.id as keyof OrgRealEstateBooking] =
      normalizeValueForSubmission(
        field,
        value,
      ) as OrgRealEstateBooking[keyof OrgRealEstateBooking];
  }

  return {
    ...updates,
    id: record.id,
  };
}
