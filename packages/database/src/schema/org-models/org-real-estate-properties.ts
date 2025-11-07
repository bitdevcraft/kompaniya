import { pgTable, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgRealEstatePropertiesTable = pgTable(
  "org_real_estate_properties",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,

    name: varchar("name", { length: 255 }),
  },
);

export type NewOrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferInsert;
export type OrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferSelect;
