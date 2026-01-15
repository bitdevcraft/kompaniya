CREATE TABLE "org_email_campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"owner_id" uuid,
	"created_by" uuid,
	"last_updated_by" uuid,
	"deleted_by" uuid,
	"custom_fields" jsonb,
	"org_email_campaign_id" uuid NOT NULL,
	"crm_contact_id" uuid,
	"org_email_id" uuid,
	"email" text NOT NULL,
	"recipient_data" jsonb,
	"is_test" boolean DEFAULT false,
	"status" text DEFAULT 'PENDING',
	"queued_at" timestamp,
	"sent_at" timestamp,
	"failed_at" timestamp,
	"failure_reason" text,
	"batch_number" integer,
	"retry_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "org_email_domain_daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"org_email_domain_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" text NOT NULL,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"bounced_count" integer DEFAULT 0,
	"complained_count" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ALTER COLUMN "status" SET DEFAULT 'DRAFT';--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "target_tags" text[];--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "tag_match_type" text DEFAULT 'ALL';--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "scheduled_for" timestamp;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "total_recipients" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "sent_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "delivered_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "opened_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "clicked_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "bounced_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "complained_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "first_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "warmup_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "daily_limit" integer;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_org_email_campaign_id_org_email_campaigns_id_fk" FOREIGN KEY ("org_email_campaign_id") REFERENCES "public"."org_email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_crm_contact_id_org_contacts_id_fk" FOREIGN KEY ("crm_contact_id") REFERENCES "public"."org_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domain_daily_stats" ADD CONSTRAINT "org_email_domain_daily_stats_org_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("org_email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE cascade ON UPDATE no action;