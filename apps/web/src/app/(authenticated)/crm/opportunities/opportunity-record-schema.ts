import type { OrgOpportunity } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const opportunityRecordSchema = z.object({
  accountId: z.string().optional(),
  amount: z.string().optional(),
  campaignId: z.string().optional(),
  currencyCode: z.string().optional(),
  description: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  forecastCategory: z.string().optional(),
  lastActivityAt: z.string().optional(),
  name: z.string().optional(),
  nextActivityAt: z.string().optional(),
  nextStep: z.string().optional(),
  pipelineId: z.string().optional(),
  primaryContactId: z.string().optional(),
  probability: z.string().optional(),
  stageId: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  type: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional(),
  sourceDetail: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmMedium: z.string().optional(),
  utmSource: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

export type OpportunityRecordFormValues = z.input<
  typeof opportunityRecordSchema
>;
export type OpportunityRecordSubmitValues = z.output<
  typeof opportunityRecordSchema
>;

export function createOpportunityFormDefaults(
  record: OrgOpportunity,
  layout: RecordPageLayout<OpportunityRecordFormValues>,
): OpportunityRecordFormValues {
  const defaults: Partial<OpportunityRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    if (field.type === "multipicklist" && normalized === "") {
      // @ts-expect-error todo fix-types
      defaults[field.id] = [] as OpportunityRecordFormValues[typeof field.id];
      continue;
    }

    // @ts-expect-error todo fix-types
    defaults[field.id] =
      normalized as OpportunityRecordFormValues[typeof field.id];
  }

  return defaults as OpportunityRecordFormValues;
}

export function createOpportunityUpdatePayload(
  record: OrgOpportunity,
  values: OpportunityRecordSubmitValues,
  layout: RecordPageLayout<OpportunityRecordFormValues>,
): Partial<OrgOpportunity> {
  const updates: Partial<OrgOpportunity> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    // @ts-expect-error todo fix-types
    const value = values[field.id];
    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgOpportunity] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgOpportunity[keyof OrgOpportunity];
  }

  return {
    ...updates,
    id: record.id,
  };
}
