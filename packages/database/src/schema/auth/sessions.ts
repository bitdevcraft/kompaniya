import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { Organization, organizationsTable } from "./organizations";
import { Team, teamsTable } from "./teams";
import { User, usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  ...baseIdModel,
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  activeOrganizationId: uuid("active_organization_id"),
  activeTeamId: uuid("active_team_id"),
  impersonatedBy: uuid("impersonated_by"),
});

export const sessionRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [sessionsTable.activeOrganizationId],
    references: [organizationsTable.id],
  }),
  team: one(teamsTable, {
    fields: [sessionsTable.activeTeamId],
    references: [teamsTable.id],
  }),
}));

export type NewSession = typeof sessionsTable.$inferInsert;
export type Session = typeof sessionsTable.$inferSelect;

export type UserSession = Session & {
  user: User | null;
  organization: Organization | null;
  team: Team | null;
};
