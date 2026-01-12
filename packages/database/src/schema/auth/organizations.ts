import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
  deletedAt: timestamp("deleted_at"),
  metadata: text("metadata"),
  organizationSize: text("organization_size"),
  industry: text("industry"),
  numberOfUsers: integer("number_of_users"),
  numberOfEmailDomains: integer("number_of_email_domains"),
  numberOfRoles: integer("number_of_roles"),
  numberOfTeams: integer("number_of_teams"),
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
