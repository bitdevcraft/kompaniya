import { uuid } from "drizzle-orm/pg-core";

import { usersTable } from "../auth";

export const baseOrganizationModel = {
  ownerId: uuid("owner_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
};
