import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { organizationsTable } from "../auth";
import { usersTable } from "../auth";

export const csvImportJobStatusEnum = pgEnum("csv_import_job_status", [
  "queued",
  "processing",
  "completed",
  "failed",
  "partial_success",
]);

export const csvImportJobsTable = pgTable(
  "csv_import_jobs",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,

    // Job identification
    bullJobId: varchar("bull_job_id", { length: 255 }).unique(),

    // Import configuration
    tableId: varchar("table_id", { length: 255 }).notNull(),
    fileId: varchar("file_id", { length: 255 }).notNull(),
    fileName: varchar("file_name", { length: 1024 }),

    // Status tracking
    status: csvImportJobStatusEnum("status").notNull().default("queued"),

    // Progress tracking
    totalRows: integer("total_rows"),
    processedRows: integer("processed_rows").notNull().default(0),
    successfulRows: integer("successful_rows").notNull().default(0),
    failedRows: integer("failed_rows").notNull().default(0),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Error information
    errorMessage: text("error_message"),
    errorDetails: text("error_details"),

    // User who initiated the import
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("csv_import_jobs_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("csv_import_jobs_status_idx").on(table.status),
    index("csv_import_jobs_bull_job_id_idx").on(table.bullJobId),
  ],
);

export const csvImportJobRowResultsTable = pgTable(
  "csv_import_job_row_results",
  {
    ...baseIdModel,

    job: uuid("job_id")
      .references(() => csvImportJobsTable.id, { onDelete: "cascade" })
      .notNull(),

    // Row information
    rowNumber: integer("row_number").notNull(),

    // Status: 'success' | 'failed'
    status: varchar("status", { length: 20 }).notNull(),

    // The data that was processed
    rowData: text("row_data"),

    // Error information (if failed)
    errorMessage: text("error_message"),
    errorField: varchar("error_field", { length: 255 }),

    // For successful inserts/updates, the resulting record ID
    recordId: uuid("record_id"),
  },
  (table) => [
    index("csv_import_row_results_job_idx").on(table.job),
    index("csv_import_row_results_status_idx").on(table.status),
  ],
);

// Relations
export const csvImportJobRelations = relations(
  csvImportJobsTable,
  ({ many, one }) => ({
    organization: one(organizationsTable, {
      fields: [csvImportJobsTable.organizationId],
      references: [organizationsTable.id],
    }),
    rowResults: many(csvImportJobRowResultsTable),
    creator: one(usersTable, {
      fields: [csvImportJobsTable.createdBy],
      references: [usersTable.id],
    }),
  }),
);

export const csvImportRowResultRelations = relations(
  csvImportJobRowResultsTable,
  ({ one }) => ({
    job: one(csvImportJobsTable, {
      fields: [csvImportJobRowResultsTable.job],
      references: [csvImportJobsTable.id],
    }),
  }),
);

// Type exports
export type CsvImportJob = typeof csvImportJobsTable.$inferSelect;
export type CsvImportJobRowResult =
  typeof csvImportJobRowResultsTable.$inferSelect;
export type CsvImportJobStatus =
  (typeof csvImportJobStatusEnum.enumValues)[number];
export type NewCsvImportJob = typeof csvImportJobsTable.$inferInsert;
export type NewCsvImportJobRowResult =
  typeof csvImportJobRowResultsTable.$inferInsert;
