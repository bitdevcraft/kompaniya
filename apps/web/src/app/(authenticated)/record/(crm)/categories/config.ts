import { OrgCategory } from "@repo/database/schema";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export type tableType = OrgCategory;

export const model = {
  name: "category",
  plural: "categories",
};

export type OrganizationModel = ReturnType<
  typeof authClient.useActiveOrganization
>;

export const dictTranslation = "crm.category";

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}`;
