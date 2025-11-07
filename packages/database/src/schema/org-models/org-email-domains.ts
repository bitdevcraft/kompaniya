import { boolean, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgEmailDomainsTable = pgTable("org_email_domains", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  name: varchar("name", { length: 255 }),
  verified: boolean("verified").default(false),
  email: varchar("email", { length: 255 }),
  public: text("public").unique().notNull(),
  secret: text("secret").unique().notNull(),
  metadata: jsonb("metadata"),
  status: text("status", { enum: ["PENDING", "READY", "BLOCKED"] }),
});

export type NewOrgEmailDomain = typeof orgEmailDomainsTable.$inferInsert;
export type OrgEmailDomain = typeof orgEmailDomainsTable.$inferSelect;
