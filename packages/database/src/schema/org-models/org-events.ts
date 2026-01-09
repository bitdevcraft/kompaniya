import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { baseCustomFieldModel } from "../abstract/baseCustomFieldModel";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEventsTable = pgTable("org_events", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,
  ...baseCustomFieldModel,

  name: text("name"),
  relatedId: uuid("related_id"),
  relatedType: text("related_type"),

  payload: jsonb("payload"),
  metadata: jsonb("metadata"),
});

export type NewOrgEvent = typeof orgEventsTable.$inferInsert;
export type OrgEvent = typeof orgEventsTable.$inferSelect;
