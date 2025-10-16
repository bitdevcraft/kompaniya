import { defineConfig } from "drizzle-kit";

import { env } from "@/env";

export default defineConfig({
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./src/schema/index.ts",
});
