import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";

export const organizationsTable = pgTable("organizations", {
  ...baseIdModel,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});
