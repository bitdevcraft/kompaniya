import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.string(),
    POSTGRES_USER_ROLE: z.string().default("app_user"),
    NEXT_PUBLIC_BASE_SERVER_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_BASE_CLIENT_URL: z.url().default("http://localhost:3001"),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});
