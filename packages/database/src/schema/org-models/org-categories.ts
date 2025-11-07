import { pgTable, text } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgCategoriesTable = pgTable(
  "org_categories",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,

    name: text("name").notNull(),
  },
  (t) => [unique("category_per_organization").on(t.organizationId, t.name)],
);

export type NewOrgCategory = typeof orgCategoriesTable.$inferInsert;
export type OrgCategory = typeof orgCategoriesTable.$inferSelect;
