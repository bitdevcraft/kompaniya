import { OrgRealEstatePaymentPlan } from "@repo/database/schema";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export type tableType = OrgRealEstatePaymentPlan;

export const model = {
  name: "real-estate-payment-plan",
  plural: "real-estate-payment-plans",
};

export type OrganizationModel = ReturnType<
  typeof authClient.useActiveOrganization
>;

export const dictTranslation = "realEstate.paymentPlan";

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}`;
