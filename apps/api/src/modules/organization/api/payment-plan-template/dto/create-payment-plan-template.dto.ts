import { type NewOrgPaymentPlanTemplate } from '@repo/database/schema';

export type CreatePaymentPlanTemplateDto = Omit<
  NewOrgPaymentPlanTemplate,
  'organizationId'
>;
