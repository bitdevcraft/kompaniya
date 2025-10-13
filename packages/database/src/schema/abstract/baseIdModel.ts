import { uuid } from "drizzle-orm/pg-core";

export const baseIdModel = {
  id: uuid("id").primaryKey().defaultRandom(),
};
