import type { OrgEmailCampaign } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const emailCampaignRecordSchema = z.object({
  body: z.string().optional(),
  htmlContent: z.string().optional(),
  mjmlContent: z.string().optional(),
  mjmlJsonContent: z.string().optional(),
  name: z.string().optional(),
  orgEmailDomainId: z.string().optional(),
  orgEmailTemplateId: z.string().optional(),
  orgEmailTestReceiverId: z.string().optional(),
  status: z.string().optional(),
  subject: z.string().optional(),
  tagMatchType: z.string().optional(),
  targetCategories: z.array(z.string()).optional().default([]),
  targetTags: z.array(z.string()).optional().default([]),
  scheduledFor: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  totalRecipients: z.string().optional(),
  sentCount: z.string().optional(),
  deliveredCount: z.string().optional(),
  openedCount: z.string().optional(),
  clickedCount: z.string().optional(),
  bouncedCount: z.string().optional(),
  complainedCount: z.string().optional(),
});

export type EmailCampaignRecordFormValues = z.input<
  typeof emailCampaignRecordSchema
>;
export type EmailCampaignRecordSubmitValues = z.output<
  typeof emailCampaignRecordSchema
>;

export function createEmailCampaignFormDefaults(
  record: OrgEmailCampaign,
  layout: RecordPageLayout<EmailCampaignRecordFormValues>,
): EmailCampaignRecordFormValues {
  const defaults: Partial<EmailCampaignRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    if (field.type === "multipicklist" && normalized === "") {
      // @ts-expect-error todo fix-types
      defaults[field.id] = [] as EmailCampaignRecordFormValues[typeof field.id];
      continue;
    }

    // @ts-expect-error todo fix-types
    defaults[field.id] =
      // @ts-expect-error todo fix-types
      normalized as EmailCampaignRecordFormValues[typeof field.id];
  }

  return defaults as EmailCampaignRecordFormValues;
}

export function createEmailCampaignUpdatePayload(
  record: OrgEmailCampaign,
  values: EmailCampaignRecordSubmitValues,
  layout: RecordPageLayout<EmailCampaignRecordFormValues>,
): Partial<OrgEmailCampaign> {
  const updates: Partial<OrgEmailCampaign> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    // @ts-expect-error todo fix-types
    const value = values[field.id];
    // @ts-expect-error todo fix-types
    updates[field.id as keyof OrgEmailCampaign] = normalizeValueForSubmission(
      field,
      value,
    ) as OrgEmailCampaign[keyof OrgEmailCampaign];
  }

  return {
    ...updates,
    id: record.id,
  };
}
