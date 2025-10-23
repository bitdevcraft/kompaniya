import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { accountsTable } from "./accounts";
import { apikeysTable } from "./api-keys";
import { invitationsTable } from "./invitations";
import { membersTable } from "./members";
import { sessionsTable } from "./sessions";
import { teamMembersTable } from "./team-members";

export const usersTable = pgTable("users", {
  ...baseIdModel,
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified"),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  metadata: jsonb("metadata"),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  accounts: many(accountsTable),
  apiKeys: many(apikeysTable),
  members: many(membersTable),
  invitations: many(invitationsTable),
  sessions: many(sessionsTable),
  teamMembers: many(teamMembersTable),
}));

export type NewUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
