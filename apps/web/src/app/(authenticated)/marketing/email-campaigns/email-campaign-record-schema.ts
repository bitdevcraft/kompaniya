import { z } from "zod";

export const emailCampaignRecordSchema = z.object({
  body: z.string().optional(),
  name: z.string().optional(),
  orgEmailDomainId: z.string().optional(),
  orgEmailTemplateId: z.string().optional(),
  orgEmailTestReceiverId: z.string().optional(),
  status: z.string().optional(),
  subject: z.string().optional(),
  targetCategories: z.array(z.string()).optional().default([]),
});

export type EmailCampaignRecordFormValues = z.input<
  typeof emailCampaignRecordSchema
>;
export type EmailCampaignRecordSubmitValues = z.output<
  typeof emailCampaignRecordSchema
>;
