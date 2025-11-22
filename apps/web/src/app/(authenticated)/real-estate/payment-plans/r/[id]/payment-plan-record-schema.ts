import type { OrgPaymentPlan } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const paymentPlanRecordSchema = z.object({
  createdAt: z.string().optional(),
  currency: z.string().optional(),
  endDate: z.string().optional(),
  name: z.string().optional(),
  principalAmount: z.string().optional(),
  startDate: z.string().optional(),
  status: z.string().optional(),
  templateId: z.number().optional(),
  updatedAt: z.string().optional(),
});

export type PaymentPlanRecordFormValues = z.input<
  typeof paymentPlanRecordSchema
>;
export type PaymentPlanRecordSubmitValues = z.output<
  typeof paymentPlanRecordSchema
>;

export function createPaymentPlanFormDefaults(
  record: OrgPaymentPlan,
  layout: RecordPageLayout<PaymentPlanRecordFormValues>,
): PaymentPlanRecordFormValues {
  const defaults: Partial<PaymentPlanRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] =
      normalized as PaymentPlanRecordFormValues[typeof field.id];
  }

  return defaults as PaymentPlanRecordFormValues;
}

export function createPaymentPlanUpdatePayload(
  record: OrgPaymentPlan,
  values: PaymentPlanRecordSubmitValues,
  layout: RecordPageLayout<PaymentPlanRecordFormValues>,
): Partial<OrgPaymentPlan> {
  const updates: Partial<OrgPaymentPlan> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];
    updates[field.id as keyof OrgPaymentPlan] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgPaymentPlan[keyof OrgPaymentPlan];
  }

  return {
    ...updates,
    id: record.id,
  };
}
