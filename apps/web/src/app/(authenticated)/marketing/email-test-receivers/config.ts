import { OrgEmailTestReceiver } from "@repo/database/schema";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export type tableType = OrgEmailTestReceiver;

export const model = {
  name: "email-test-receiver",
  plural: "email-test-receivers",
};

export type OrganizationModel = ReturnType<
  typeof authClient.useActiveOrganization
>;

export const dictTranslation = "marketing.emailTestReceiver";

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}`;
