CREATE TYPE "public"."csv_import_job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'partial_success');--> statement-breakpoint
CREATE TABLE "csv_import_job_row_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"row_data" text,
	"error_message" text,
	"error_field" varchar(255),
	"record_id" uuid
);
--> statement-breakpoint
CREATE TABLE "csv_import_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"bull_job_id" varchar(255),
	"table_id" varchar(255) NOT NULL,
	"file_id" varchar(255) NOT NULL,
	"file_name" varchar(1024),
	"status" "csv_import_job_status" DEFAULT 'queued' NOT NULL,
	"total_rows" integer,
	"processed_rows" integer DEFAULT 0 NOT NULL,
	"successful_rows" integer DEFAULT 0 NOT NULL,
	"failed_rows" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"error_details" text,
	"created_by" uuid,
	CONSTRAINT "csv_import_jobs_bull_job_id_unique" UNIQUE("bull_job_id")
);
--> statement-breakpoint
ALTER TABLE "csv_import_job_row_results" ADD CONSTRAINT "csv_import_job_row_results_job_id_csv_import_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."csv_import_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "csv_import_row_results_job_idx" ON "csv_import_job_row_results" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "csv_import_row_results_status_idx" ON "csv_import_job_row_results" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csv_import_jobs_org_created_idx" ON "csv_import_jobs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "csv_import_jobs_status_idx" ON "csv_import_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csv_import_jobs_bull_job_id_idx" ON "csv_import_jobs" USING btree ("bull_job_id");