ALTER TABLE "org_accounts" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_activities" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_categories" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_emails" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_events" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_leads" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_payment_plan_templates" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD COLUMN "custom_fields" jsonb;