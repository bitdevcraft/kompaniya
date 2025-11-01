import { uuid } from "drizzle-orm/pg-core";

import { organizationsTable } from "../auth";

export const baseOrganizationModel = {
  organizationId: uuid("organization_id").references(
    () => organizationsTable.id,
    { onDelete: "no action" },
  ),
};
