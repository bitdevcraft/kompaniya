import { OrgPaymentPlanTemplate } from "@repo/database/schema";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export type tableType = OrgPaymentPlanTemplate;

export const model = {
  name: "payment-plan-template",
  plural: "payment-plan-templates",
};

export type OrganizationModel = ReturnType<
  typeof authClient.useActiveOrganization
>;

export const dictTranslation = "realEstate.paymentPlanTemplate";

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}`;
