import { type NewOrgRealEstatePaymentPlan } from '@repo/database/schema';

export type CreateRealEstatePaymentPlanDto = Omit<
  NewOrgRealEstatePaymentPlan,
  'organizationId'
>;
