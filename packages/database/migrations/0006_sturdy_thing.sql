CREATE TYPE "public"."opportunity_forecast_category" AS ENUM('pipeline', 'best_case', 'commit', 'omitted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."opportunity_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('open', 'won', 'lost', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('new_business', 'renewal', 'upsell', 'cross_sell');--> statement-breakpoint
ALTER TABLE "org_accounts" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_activities" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_categories" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_emails" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_events" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_leads" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "owner_user_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "team_id" varchar(36);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "account_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "primary_contact_id" varchar(36);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "type" "opportunity_type" DEFAULT 'new_business' NOT NULL;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "pipeline_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "stage_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "status" "opportunity_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "probability" integer;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "forecast_category" "opportunity_forecast_category";--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "currency_code" varchar(3);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "exchange_rate" numeric(12, 6);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "amount_home" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "expected_close_date" date;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "last_activity_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "next_activity_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "closed_won_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "closed_lost_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "next_step" text;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "source" varchar(128);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "source_detail" varchar(256);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "campaign_id" varchar(36);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "utm_source" varchar(100);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "utm_medium" varchar(100);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "utm_campaign" varchar(100);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "utm_term" varchar(100);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "utm_content" varchar(100);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "lost_reason_id" varchar(36);--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "lost_reason_note" text;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "priority" "opportunity_priority";--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "tags" varchar(255)[];--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD CONSTRAINT "org_real_estate_payment-plans_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;