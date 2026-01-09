import { OrgLead } from "@repo/database/schema";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export type tableType = OrgLead;

export const model = {
  name: "lead",
  plural: "leads",
};

export type OrganizationModel = ReturnType<
  typeof authClient.useActiveOrganization
>;

export const dictTranslation = "crm.lead";

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}`;
