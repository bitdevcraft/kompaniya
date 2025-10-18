import {
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
          },
        },
      }),
    }),

    //
    inferAdditionalFields({
      user: {
        metadata: {
          type: "string",
        },
      },
    }),
  ],
});
