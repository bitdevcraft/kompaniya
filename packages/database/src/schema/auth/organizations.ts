import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { invitationsTable } from "./invitations";
import { membersTable } from "./members";
import { teamsTable } from "./teams";

export const organizationsTable = pgTable("organizations", {
  ...baseIdModel,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
  organizationSize: text("organization_size"),
  industry: text("industry"),
  active: boolean("active").default(true),
  isSuper: boolean("is_super").unique(),
});

export const organizationRelations = relations(
  organizationsTable,
  ({ many }) => ({
    invitations: many(invitationsTable),
    members: many(membersTable),
    teams: many(teamsTable),
  }),
);

export type NewOrganization = typeof organizationsTable.$inferInsert;
export type Organization = typeof organizationsTable.$inferSelect;
