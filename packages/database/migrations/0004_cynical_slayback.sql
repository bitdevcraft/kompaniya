CREATE TYPE "public"."table_preferences_entity_type" AS ENUM('org_contacts', 'org_leads', 'org_accounts', 'org_opportunities', 'org_activities', 'org_categories', 'org_tags', 'org_events', 'org_tasks', 'org_email_templates', 'org_email_campaigns', 'org_email_domains', 'org_real_estate_projects', 'org_real_estate_properties', 'org_real_estate_bookings', 'org_payment_plans', 'org_payment_plan_templates', 'org_email_test_receivers', 'org_emails', 'org_email_clicks', 'org_real_estate_booking_buyers');--> statement-breakpoint
CREATE TABLE "org_user_table_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" "table_preferences_entity_type" NOT NULL,
	"preferences" jsonb NOT NULL,
	"is_customized" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_user_table_preferences" ADD CONSTRAINT "org_user_table_preferences_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_user_table_preferences" ADD CONSTRAINT "org_user_table_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;