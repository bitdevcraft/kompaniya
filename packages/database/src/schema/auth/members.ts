import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { organizationsTable } from "./organizations";
import { usersTable } from "./users";

export const membersTable = pgTable("members", {
  ...baseIdModel,
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const memberRelations = relations(membersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [membersTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export type Member = typeof membersTable.$inferSelect;
export type NewMember = typeof membersTable.$inferInsert;
