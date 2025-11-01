/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import { sql } from "drizzle-orm";
import { ExtraConfigColumn, pgPolicy } from "drizzle-orm/pg-core";

import { env } from "@/env";

export function createOrganizationPolicies<
  T extends {
    organizationId: ExtraConfigColumn;
  },
>(tableName: string, t: T) {
  const ROLE = env.POSTGRES_USER_ROLE;
  const sessionCheck = sql`${t.organizationId} = current_setting('app.current_organization')::uuid`;

  return [
    pgPolicy(`${tableName}_select_organization`, {
      for: "select",
      to: ROLE,
      using: sessionCheck,
    }),
    pgPolicy(`${tableName}_insert_organization`, {
      for: "insert",
      to: ROLE,
      withCheck: sessionCheck,
    }),
    pgPolicy(`${tableName}_update_organization`, {
      for: "update",
      to: ROLE,
      using: sessionCheck,
      withCheck: sessionCheck,
    }),
    pgPolicy(`${tableName}_delete_organization`, {
      for: "delete",
      to: ROLE,
      using: sessionCheck,
    }),
  ];
}
