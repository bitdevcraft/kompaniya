import { pgTable, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgRealEstatePropertiesTable = pgTable(
  "org_real_estate_properties",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    name: varchar("name", { length: 255 }),
  },
);

export type NewOrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferInsert;
export type OrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferSelect;
