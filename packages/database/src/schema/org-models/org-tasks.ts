import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgTasksTable = pgTable("org_tasks", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,

  runBy: timestamp("run_by", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),

  relatedId: uuid("related_id"),
  relatedType: text("related_type"),

  metadata: jsonb("metadata"),
});

export type NewOrgTask = typeof orgTasksTable.$inferInsert;
export type OrgTask = typeof orgTasksTable.$inferSelect;
