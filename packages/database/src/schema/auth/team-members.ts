import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const teamMembersTable = pgTable("team_members", {
  ...baseIdModel,
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
});
