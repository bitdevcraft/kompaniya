import { defineConfig } from "drizzle-kit";
import { createInsertSchema } from "drizzle-zod";

import { env } from "@/env";
import { otpVerifications } from "@/schema/otp-verifications";

export default defineConfig({
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./src/schema/index.ts",
});

export const insertOtpVerificationSchema = createInsertSchema(
  otpVerifications,
).omit({
  attempts: true,
  createdAt: true,
  id: true,
  verified: true,
});
