import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.string(),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});
