import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";

export const verificationsTable = pgTable("verifications", {
  ...baseIdModel,
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
