import type { OrgPaymentPlanTemplate } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const paymentPlanTemplateRecordSchema = z.object({
  code: z.string().optional(),
  createdAt: z.string().optional(),
  defaultCurrency: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  maxPrincipal: z.string().optional(),
  minPrincipal: z.string().optional(),
  name: z.string().optional(),
  subjectType: z.string().optional(),
  templateConfig: z.unknown().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export type PaymentPlanTemplateRecordFormValues = z.input<
  typeof paymentPlanTemplateRecordSchema
>;
export type PaymentPlanTemplateRecordSubmitValues = z.output<
  typeof paymentPlanTemplateRecordSchema
>;

export function createPaymentPlanTemplateFormDefaults(
  record: OrgPaymentPlanTemplate,
  layout: RecordPageLayout<PaymentPlanTemplateRecordFormValues>,
): PaymentPlanTemplateRecordFormValues {
  const defaults: Partial<PaymentPlanTemplateRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] =
      normalized as PaymentPlanTemplateRecordFormValues[typeof field.id];
  }

  return defaults as PaymentPlanTemplateRecordFormValues;
}

export function createPaymentPlanTemplateUpdatePayload(
  record: OrgPaymentPlanTemplate,
  values: PaymentPlanTemplateRecordSubmitValues,
  layout: RecordPageLayout<PaymentPlanTemplateRecordFormValues>,
): Partial<OrgPaymentPlanTemplate> {
  const updates: Partial<OrgPaymentPlanTemplate> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];
    updates[field.id as keyof OrgPaymentPlanTemplate] =
      normalizeValueForSubmission(
        field,
        value,
      ) as OrgPaymentPlanTemplate[keyof OrgPaymentPlanTemplate];
  }

  return {
    ...updates,
    id: record.id,
  };
}
