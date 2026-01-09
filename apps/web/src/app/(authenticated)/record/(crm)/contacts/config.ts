import { OrgContact } from "@repo/database/schema";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export type tableType = OrgContact;

export const model = {
  name: "contact",
  plural: "contacts",
};

export type OrganizationModel = ReturnType<
  typeof authClient.useActiveOrganization
>;

export const dictTranslation = "crm.activity";

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}`;
