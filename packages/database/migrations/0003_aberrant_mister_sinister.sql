CREATE TYPE "public"."record_layout_entity_type" AS ENUM('org_contacts', 'org_leads', 'org_accounts', 'org_opportunities', 'org_activities', 'org_categories', 'org_tags', 'org_events', 'org_tasks', 'org_email_templates', 'org_email_campaigns', 'org_email_domains', 'org_real_estate_projects', 'org_real_estate_properties', 'org_real_estate_bookings', 'org_payment_plans', 'org_payment_plan_templates', 'org_email_test_receivers', 'org_emails', 'org_email_clicks', 'org_real_estate_booking_buyers');--> statement-breakpoint
CREATE TABLE "org_record_layouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"entity_type" "record_layout_entity_type" NOT NULL,
	"header" jsonb NOT NULL,
	"sectionColumns" jsonb,
	"sections" jsonb,
	"supplemental_fields" jsonb,
	"auto_include_custom_fields" boolean DEFAULT true NOT NULL,
	"is_customized" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "org_record_layouts" ADD CONSTRAINT "org_record_layouts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_record_layouts" ADD CONSTRAINT "org_record_layouts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_record_layouts" ADD CONSTRAINT "org_record_layouts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;