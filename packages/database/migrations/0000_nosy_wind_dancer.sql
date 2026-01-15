CREATE TYPE "public"."csv_import_job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'partial_success');--> statement-breakpoint
CREATE TYPE "public"."custom_field_type" AS ENUM('string', 'number', 'boolean', 'date', 'datetime', 'single_select', 'multi_select', 'json', 'reference');--> statement-breakpoint
CREATE TYPE "public"."opportunity_forecast_category" AS ENUM('pipeline', 'best_case', 'commit', 'omitted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."opportunity_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('open', 'won', 'lost', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('new_business', 'renewal', 'upsell', 'cross_sell');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_booking_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_project_status" AS ENUM('planning', 'active', 'completed', 'on_hold', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_property_listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_property_status" AS ENUM('available', 'reserved', 'sold', 'rented', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_property_type" AS ENUM('unit', 'plot', 'villa', 'apartment', 'other');--> statement-breakpoint
CREATE TYPE "public"."record_layout_entity_type" AS ENUM('org_contacts', 'org_leads', 'org_accounts', 'org_opportunities', 'org_activities', 'org_categories', 'org_tags', 'org_events', 'org_tasks', 'org_email_templates', 'org_email_campaigns', 'org_email_domains', 'org_real_estate_projects', 'org_real_estate_properties', 'org_real_estate_bookings', 'org_payment_plans', 'org_payment_plan_templates', 'org_email_test_receivers', 'org_emails', 'org_email_clicks', 'org_real_estate_booking_buyers');--> statement-breakpoint
CREATE TYPE "public"."table_preferences_entity_type" AS ENUM('org_contacts', 'org_leads', 'org_accounts', 'org_opportunities', 'org_activities', 'org_categories', 'org_tags', 'org_events', 'org_tasks', 'org_email_templates', 'org_email_campaigns', 'org_email_domains', 'org_real_estate_projects', 'org_real_estate_properties', 'org_real_estate_bookings', 'org_payment_plans', 'org_payment_plan_templates', 'org_email_test_receivers', 'org_emails', 'org_email_clicks', 'org_real_estate_booking_buyers');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apikeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" uuid NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"team_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"metadata" text,
	"organization_size" text,
	"industry" text,
	"number_of_users" integer,
	"number_of_email_domains" integer,
	"number_of_roles" integer,
	"number_of_teams" integer,
	"active" boolean DEFAULT true,
	"is_super" boolean,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_is_super_unique" UNIQUE("is_super")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"active_organization_id" uuid,
	"active_team_id" uuid,
	"impersonated_by" uuid,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"phone_number" text,
	"phone_number_verified" boolean,
	"role" text,
	"banned" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"ban_reason" text,
	"ban_expires" timestamp,
	"metadata" jsonb,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "custom_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"entity_type" varchar(128) NOT NULL,
	"key" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"description" text,
	"field_type" "custom_field_type" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"default_value" jsonb,
	"choices" jsonb,
	"reference_config" jsonb,
	"validation" jsonb,
	"is_indexed" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	CONSTRAINT "custom_field_definitions_org_entity_key_unique" UNIQUE("organization_id","entity_type","key")
);
--> statement-breakpoint
CREATE TABLE "org_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"owner_id" uuid,
	"created_by" uuid,
	"last_updated_by" uuid,
	"deleted_by" uuid,
	"name" varchar(1024),
	"phone" varchar(50),
	"phone_e164" varchar(50),
	"email" varchar(255),
	"email_normalized" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"categories" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"last_activity_at" timestamp with time zone,
	"next_activity_at" timestamp with time zone,
	"score" numeric(10, 2),
	"linkedin_url" text,
	"twitter_handle" text,
	"website_url" text,
	"company_name" text,
	"avatar_url" text,
	"birthday" timestamp,
	"industry" text,
	"annual_revenue_band" text,
	"employee_count_band" text,
	"shipping_address_line1" text,
	"shipping_address_line2" text,
	"shipping_city" text,
	"shipping_region" text,
	"shipping_postal_code" text,
	"shipping_country_code" char(3),
	"shipping_latitude" numeric(9, 6),
	"shipping_longitude" numeric(9, 6),
	"billing_address_line1" text,
	"billing_address_line2" text,
	"billing_city" text,
	"billing_region" text,
	"billing_postal_code" text,
	"billing_country_code" char(3),
	"billing_latitude" numeric(9, 6),
	"billing_longitude" numeric(9, 6),
	"custom_fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "org_activities" (
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
	"name" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE "org_categories" (
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
	"name" text NOT NULL,
	CONSTRAINT "category_per_organization" UNIQUE("organization_id","name")
);
--> statement-breakpoint
CREATE TABLE "org_contacts" (
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
	"first_name" varchar(255),
	"last_name" varchar(255),
	"salutation" varchar(255),
	"name" varchar(1024) GENERATED ALWAYS AS (btrim(
        coalesce("org_contacts"."salutation" || ' ', '') ||
        "org_contacts"."first_name" || ' ' || "org_contacts"."last_name"
      )) STORED,
	"phone" varchar(50),
	"phone_e164" varchar(50),
	"email" varchar(255),
	"email_normalized" text,
	"nationality" varchar(255),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"categories" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"last_activity_at" timestamp with time zone,
	"next_activity_at" timestamp with time zone,
	"score" numeric(10, 2),
	"email_opt_in" boolean DEFAULT false NOT NULL,
	"sms_opt_in" boolean DEFAULT false NOT NULL,
	"phone_opt_in" boolean DEFAULT false NOT NULL,
	"email_confirmed_at" timestamp with time zone,
	"consent_captured_at" timestamp with time zone,
	"consent_source" text,
	"consent_ip" "inet",
	"gdpr_consent_scope" text,
	"do_not_contact" boolean DEFAULT false NOT NULL,
	"do_not_sell" boolean DEFAULT false NOT NULL,
	"shipping_address_line1" text,
	"shipping_address_line2" text,
	"shipping_city" text,
	"shipping_region" text,
	"shipping_postal_code" text,
	"shipping_country_code" char(3),
	"shipping_latitude" numeric(9, 6),
	"shipping_longitude" numeric(9, 6),
	"billing_address_line1" text,
	"billing_address_line2" text,
	"billing_city" text,
	"billing_region" text,
	"billing_postal_code" text,
	"billing_country_code" char(3),
	"billing_latitude" numeric(9, 6),
	"billing_longitude" numeric(9, 6),
	"language_pref" text,
	"dedupe_key" text,
	"external_ids" jsonb,
	"linkedin_url" text,
	"twitter_handle" text,
	"website_url" text,
	"company_name" text,
	"avatar_url" text,
	"birthday" timestamp,
	"industry" text,
	"annual_revenue_band" text,
	"employee_count_band" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "org_email_bounce_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"bounce_type" text NOT NULL,
	"bounce_subtype" text,
	"diagnostic_code" text,
	"recipients" jsonb,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "org_email_campaigns" (
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
	"name" varchar(255),
	"subject" varchar(998),
	"body" text,
	"mjml_content" text,
	"mjml_json_content" text,
	"html_content" text,
	"org_email_domain_id" uuid,
	"org_email_template_id" uuid,
	"org_email_test_receiver_id" uuid,
	"target_categories" jsonb DEFAULT '[]'::jsonb,
	"target_tags" jsonb DEFAULT '[]'::jsonb,
	"tag_match_type" text DEFAULT 'ALL',
	"status" text DEFAULT 'DRAFT',
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"bounced_count" integer DEFAULT 0,
	"complained_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "org_email_click_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"org_email_id" uuid,
	"link" text NOT NULL,
	"link_tags" jsonb,
	"user_agent" text,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_clicks" (
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
	"link" text,
	"org_email_id" uuid,
	"org_email_domain_id" uuid
);
--> statement-breakpoint
CREATE TABLE "org_email_complaint_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"complaint_feedback_type" text,
	"complaint_feedback_subtype" text,
	"arrival_date" timestamp with time zone,
	"recipients" jsonb,
	"user_agent" text,
	"complaint_feedback_id" text,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_delivery_delay_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"delay_type" text,
	"recipients" jsonb,
	"delay_seconds" text,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_delivery_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"status" text,
	"processing_time_millis" text,
	"smtp_response" text,
	"reporting_mta" text,
	"recipients" jsonb,
	"event_timestamp" timestamp with time zone NOT NULL
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
CREATE TABLE "org_email_domains" (
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
	"name" varchar(255),
	"verified" boolean DEFAULT false,
	"email" varchar(255),
	"public" text NOT NULL,
	"secret" text NOT NULL,
	"metadata" jsonb,
	"status" text,
	"first_email_sent_at" timestamp,
	"warmup_completed_at" timestamp,
	"daily_limit" integer,
	CONSTRAINT "org_email_domains_public_unique" UNIQUE("public"),
	CONSTRAINT "org_email_domains_secret_unique" UNIQUE("secret")
);
--> statement-breakpoint
CREATE TABLE "org_email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"event_type" text NOT NULL,
	"raw_event" jsonb,
	"ses_data" jsonb,
	"processed" text DEFAULT 'PENDING' NOT NULL,
	"processing_error" text,
	"event_timestamp" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "org_email_open_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"org_email_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_reject_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"reason" text NOT NULL,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_rendering_failure_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"template_name" text,
	"error_message" text NOT NULL,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_send_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" text NOT NULL,
	"org_email_event_id" uuid,
	"recipient_count" text,
	"sending_account_id" text,
	"event_timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_email_templates" (
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
	"name" varchar(255),
	"subject" varchar(998),
	"body" text,
	"mjml_content" text,
	"mjml_json_content" text,
	"html_content" text
);
--> statement-breakpoint
CREATE TABLE "org_email_test_receivers" (
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
	"name" varchar(255),
	"emails" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "org_emails" (
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
	"message_id" text,
	"subject" varchar(998),
	"body" text,
	"raw_message" text,
	"status" text,
	"email_campaign_id" uuid,
	"email_domain_id" uuid,
	"crm_contact_id" uuid,
	CONSTRAINT "org_emails_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "org_events" (
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
	"name" text,
	"related_id" uuid,
	"related_type" text,
	"payload" jsonb,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "org_leads" (
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
	"first_name" varchar(255),
	"last_name" varchar(255),
	"salutation" varchar(255),
	"name" varchar(1024) GENERATED ALWAYS AS (btrim(
        coalesce("org_leads"."salutation" || ' ', '') ||
        "org_leads"."first_name" || ' ' || "org_leads"."last_name"
      )) STORED,
	"phone" varchar(50),
	"phone_e164" varchar(50),
	"email" varchar(255),
	"email_normalized" text,
	"nationality" varchar(255),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"categories" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"last_activity_at" timestamp with time zone,
	"next_activity_at" timestamp with time zone,
	"score" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "org_opportunities" (
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
	"name" varchar(1024),
	"description" text,
	"owner_user_id" uuid,
	"team_id" uuid,
	"account_id" uuid,
	"primary_contact_id" uuid,
	"type" "opportunity_type" DEFAULT 'new_business' NOT NULL,
	"status" "opportunity_status" DEFAULT 'open' NOT NULL,
	"probability" integer,
	"forecast_category" "opportunity_forecast_category",
	"amount" numeric(14, 2),
	"currency_code" varchar(3),
	"exchange_rate" numeric(12, 6),
	"amount_home" numeric(14, 2),
	"expected_close_date" date,
	"last_activity_at" timestamp with time zone,
	"next_activity_at" timestamp with time zone,
	"closed_won_at" timestamp with time zone,
	"closed_lost_at" timestamp with time zone,
	"next_step" text,
	"source" varchar(128),
	"source_detail" varchar(256),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"utm_term" varchar(100),
	"utm_content" varchar(100),
	"lost_reason_id" varchar(36),
	"lost_reason_note" text,
	"priority" "opportunity_priority",
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_payment_plan_templates" (
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
	"code" varchar(100) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_currency" char(3),
	"subject_type" varchar(100),
	"min_principal" numeric(18, 2),
	"max_principal" numeric(18, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"template_config" jsonb NOT NULL,
	CONSTRAINT "org_payment_plan_templates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "org_payment_plans" (
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
	"name" varchar(255),
	"template_id" uuid,
	"currency" char(3) NOT NULL,
	"principal_amount" numeric(18, 2) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" varchar(50) NOT NULL,
	"instance_config" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_real_estate_booking_buyers" (
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
	"bookingId" uuid,
	"contactId" uuid,
	"is_primary_buyer" boolean DEFAULT false,
	CONSTRAINT "buyers" UNIQUE("bookingId","contactId")
);
--> statement-breakpoint
CREATE TABLE "org_real_estate_bookings" (
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
	"name" varchar(255),
	"reference_code" varchar(100),
	"project_id" uuid,
	"property_id" uuid,
	"booking_type" "org_real_estate_booking_type",
	"status" "org_real_estate_booking_status" DEFAULT 'pending',
	"amount" numeric(14, 2),
	"currency_code" varchar(3),
	"deposit_amount" numeric(14, 2),
	"expected_completion_at" timestamp with time zone,
	"contract_signed_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "org_real_estate_projects" (
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
	"name" varchar(255),
	"description" text,
	"developer_name" varchar(255),
	"status" "org_real_estate_project_status" DEFAULT 'planning',
	"launch_year" integer,
	"expected_completion_year" integer,
	"total_units" integer,
	"city" varchar(150),
	"state" varchar(150),
	"country" varchar(150),
	"address_line_1" varchar(255),
	"address_line_2" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "org_real_estate_properties" (
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
	"name" varchar(255),
	"description" text,
	"property_code" varchar(100),
	"project_id" uuid,
	"property_type" "org_real_estate_property_type",
	"listing_type" "org_real_estate_property_listing_type",
	"status" "org_real_estate_property_status" DEFAULT 'available',
	"bedrooms" integer,
	"bathrooms" integer,
	"floor" varchar(50),
	"area" numeric(12, 2),
	"area_unit" varchar(50),
	"address_line_1" varchar(255),
	"address_line_2" varchar(255),
	"city" varchar(150),
	"state" varchar(150),
	"country" varchar(150),
	"postal_code" varchar(20),
	"asking_price" numeric(14, 2),
	"asking_rent" numeric(14, 2),
	"currency_code" varchar(3),
	"is_furnished" boolean DEFAULT false,
	"parking_spots" integer
);
--> statement-breakpoint
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
CREATE TABLE "org_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"owner_id" uuid,
	"created_by" uuid,
	"last_updated_by" uuid,
	"deleted_by" uuid,
	"name" text,
	"related_type" text
);
--> statement-breakpoint
CREATE TABLE "org_tasks" (
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
	"run_by" timestamp with time zone DEFAULT now() NOT NULL,
	"related_id" uuid,
	"related_type" text,
	"metadata" jsonb
);
--> statement-breakpoint
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
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikeys" ADD CONSTRAINT "apikeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_roles" ADD CONSTRAINT "organization_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csv_import_job_row_results" ADD CONSTRAINT "csv_import_job_row_results_job_id_csv_import_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."csv_import_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_bounce_events" ADD CONSTRAINT "org_email_bounce_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_org_email_campaign_id_org_email_campaigns_id_fk" FOREIGN KEY ("org_email_campaign_id") REFERENCES "public"."org_email_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_crm_contact_id_org_contacts_id_fk" FOREIGN KEY ("crm_contact_id") REFERENCES "public"."org_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaign_recipients" ADD CONSTRAINT "org_email_campaign_recipients_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_org_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("org_email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_org_email_template_id_org_email_templates_id_fk" FOREIGN KEY ("org_email_template_id") REFERENCES "public"."org_email_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_org_email_test_receiver_id_org_email_test_receivers_id_fk" FOREIGN KEY ("org_email_test_receiver_id") REFERENCES "public"."org_email_test_receivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_click_events" ADD CONSTRAINT "org_email_click_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_click_events" ADD CONSTRAINT "org_email_click_events_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_org_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("org_email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_complaint_events" ADD CONSTRAINT "org_email_complaint_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_delivery_delay_events" ADD CONSTRAINT "org_email_delivery_delay_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_delivery_events" ADD CONSTRAINT "org_email_delivery_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domain_daily_stats" ADD CONSTRAINT "org_email_domain_daily_stats_org_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("org_email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_open_events" ADD CONSTRAINT "org_email_open_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_open_events" ADD CONSTRAINT "org_email_open_events_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_reject_events" ADD CONSTRAINT "org_email_reject_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_rendering_failure_events" ADD CONSTRAINT "org_email_rendering_failure_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_send_events" ADD CONSTRAINT "org_email_send_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_email_campaign_id_org_email_campaigns_id_fk" FOREIGN KEY ("email_campaign_id") REFERENCES "public"."org_email_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_crm_contact_id_org_contacts_id_fk" FOREIGN KEY ("crm_contact_id") REFERENCES "public"."org_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_account_id_org_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."org_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_primary_contact_id_org_contacts_id_fk" FOREIGN KEY ("primary_contact_id") REFERENCES "public"."org_contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plan_templates" ADD CONSTRAINT "org_payment_plan_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plan_templates" ADD CONSTRAINT "org_payment_plan_templates_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plan_templates" ADD CONSTRAINT "org_payment_plan_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plan_templates" ADD CONSTRAINT "org_payment_plan_templates_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plan_templates" ADD CONSTRAINT "org_payment_plan_templates_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_template_id_org_payment_plan_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."org_payment_plan_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_bookingId_org_real_estate_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."org_real_estate_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_contactId_org_contacts_id_fk" FOREIGN KEY ("contactId") REFERENCES "public"."org_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_project_id_org_real_estate_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."org_real_estate_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_property_id_org_real_estate_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."org_real_estate_properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_project_id_org_real_estate_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."org_real_estate_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_record_layouts" ADD CONSTRAINT "org_record_layouts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_record_layouts" ADD CONSTRAINT "org_record_layouts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_record_layouts" ADD CONSTRAINT "org_record_layouts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tags" ADD CONSTRAINT "org_tags_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tags" ADD CONSTRAINT "org_tags_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tags" ADD CONSTRAINT "org_tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tags" ADD CONSTRAINT "org_tags_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tags" ADD CONSTRAINT "org_tags_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_user_table_preferences" ADD CONSTRAINT "org_user_table_preferences_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_user_table_preferences" ADD CONSTRAINT "org_user_table_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "csv_import_row_results_job_idx" ON "csv_import_job_row_results" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "csv_import_row_results_status_idx" ON "csv_import_job_row_results" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csv_import_jobs_org_created_idx" ON "csv_import_jobs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "csv_import_jobs_status_idx" ON "csv_import_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csv_import_jobs_bull_job_id_idx" ON "csv_import_jobs" USING btree ("bull_job_id");