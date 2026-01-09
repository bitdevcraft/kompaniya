import { jsonb } from "drizzle-orm/pg-core";

export const baseCustomFieldModel = {
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
};
