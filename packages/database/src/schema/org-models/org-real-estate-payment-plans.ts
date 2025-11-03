import { pgTable, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgRealEstatePaymentPlansTable = pgTable(
  "org_real_estate_payment-plans",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    name: varchar("name", { length: 255 }),
  },
);

export type NewOrgRealEstatePaymentPlan =
  typeof orgRealEstatePaymentPlansTable.$inferInsert;
export type OrgRealEstatePaymentPlan =
  typeof orgRealEstatePaymentPlansTable.$inferSelect;
