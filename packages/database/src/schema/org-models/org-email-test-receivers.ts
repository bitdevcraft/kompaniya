import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEmailTestReceiversTable = pgTable("org_email_test_receivers", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: varchar("name", { length: 255 }),
  emails: jsonb("emails").$type<string[]>().default([]),
});

export type NewOrgEmailTestReceiver =
  typeof orgEmailTestReceiversTable.$inferInsert;
export type OrgEmailTestReceiver =
  typeof orgEmailTestReceiversTable.$inferSelect;
