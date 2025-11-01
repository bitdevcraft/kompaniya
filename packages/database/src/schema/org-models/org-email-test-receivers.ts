import { pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEmailTestReceiversTable = pgTable("org_email_test_receivers", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  name: varchar("name", { length: 255 }),
  emails: text("emails").array(),
});

export type NewOrgEmailTestReceiver =
  typeof orgEmailTestReceiversTable.$inferInsert;
export type OrgEmailTestReceiver =
  typeof orgEmailTestReceiversTable.$inferSelect;
