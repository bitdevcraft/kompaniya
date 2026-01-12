import {
  adminAccessControl,
  orgAccessControl,
  orgAdmin,
  orgMember,
  orgOwner,
  superAdmin,
  systemAdmin,
  systemUser,
} from "@repo/shared/auth";
import {
  adminClient,
  apiKeyClient,
  emailOTPClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
  phoneNumberClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env/client";

export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_BASE_SERVER_URL}`,
  plugins: [
    //
    usernameClient(),
    emailOTPClient(),
    phoneNumberClient(),
    //
    apiKeyClient(),
    adminClient({
      ac: adminAccessControl,
      roles: {
        superAdmin,
        systemUser,
        systemAdmin,
      },
    }),
    organizationClient({
      schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: {
            organizationSize: {
              type: "string",
            },
            industry: {
              type: "string",
            },
            numberOfUsers: {
              type: "number",
            },
            numberOfEmailDomains: {
              type: "number",
            },
            numberOfRoles: {
              type: "number",
            },
            numberOfTeams: {
              type: "number",
            },
          },
        },
      }),
      dynamicAccessControl: {
        enabled: true,
      },
      ac: orgAccessControl,
      roles: {
        admin: orgAdmin,
        owner: orgOwner,
        member: orgMember,
      },
    }),

    //
    inferAdditionalFields({
      user: {
        metadata: {
          type: "json",
        },
      },
    }),
  ],
});
