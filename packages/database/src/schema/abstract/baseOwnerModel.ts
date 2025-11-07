import { uuid } from "drizzle-orm/pg-core";

import { usersTable } from "../auth";

export const baseOwnerModel = {
  ownerId: uuid("owner_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdBy: uuid("created_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  lastUpdatedBy: uuid("last_updated_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  deletedBy: uuid("deleted_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
};
