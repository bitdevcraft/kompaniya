import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { organizationsTable } from "./organizations";
import { teamMembersTable } from "./team-members";

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

export const teamRelations = relations(teamsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [teamsTable.organizationId],
    references: [organizationsTable.id],
  }),
  teamMembers: many(teamMembersTable),
}));

export type NewTeam = typeof teamsTable.$inferInsert;
export type Team = typeof teamsTable.$inferSelect;
