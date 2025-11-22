import { type NewOrgPaymentPlan } from '@repo/database/schema';

export type CreatePaymentPlanDto = Omit<NewOrgPaymentPlan, 'organizationId'>;
