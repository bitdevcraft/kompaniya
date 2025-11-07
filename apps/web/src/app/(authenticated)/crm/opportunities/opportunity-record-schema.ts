import { z } from "zod";

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
