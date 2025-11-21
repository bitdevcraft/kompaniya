import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgRealEstateProjectsTable } from "./org-real-estate-projects";

export const orgRealEstatePropertiesTable = pgTable(
  "org_real_estate_properties",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,

    name: varchar("name", { length: 255 }),
    projectId: uuid("project_id").references(
      () => orgRealEstateProjectsTable.id,
      { onDelete: "restrict" },
    ),
  },
);

export type NewOrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferInsert;
export type OrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferSelect;
