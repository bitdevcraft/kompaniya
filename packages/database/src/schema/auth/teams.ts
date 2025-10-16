import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { organizationsTable } from "./organizations";

export const teamsTable = pgTable("teams", {
  ...baseIdModel,
  name: text("name").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(
    () => /* @__PURE__ */ new Date(),
  ),
});
