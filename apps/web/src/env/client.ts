import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_CLIENT_URL: z.url().min(1),
    NEXT_PUBLIC_BASE_SERVER_URL: z.url().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_CLIENT_URL: process.env.NEXT_PUBLIC_BASE_CLIENT_URL,
    NEXT_PUBLIC_BASE_SERVER_URL: process.env.NEXT_PUBLIC_BASE_SERVER_URL,
  },
});
