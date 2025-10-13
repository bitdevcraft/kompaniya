import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { getConfig } from "@/config/environments";
import { env } from "@/env";
import * as schema from "@/schema";

// Get environment-specific configuration
const config = getConfig();

// Database connection config
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Client for migrations
export const migrationClient = postgres(connectionString, {
  max: 1,
  ssl: config.database.ssl,
});

// Client for queries
export const queryClient = postgres(connectionString, {
  idle_timeout: config.database.idleTimeout,
  max: config.database.maxConnections,
  ssl: config.database.ssl,
});

// Drizzle ORM instance
export const db = drizzle(queryClient, { schema });

// Migration function
export async function runMigrations() {
  try {
    console.log("Running migrations...");

    const migrationDb = drizzle(migrationClient);

    await migrate(migrationDb, {
      migrationsFolder: "./drizzle",
    });

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
