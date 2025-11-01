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
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	"organization_size" text,
	"industry" text,
	"active" boolean DEFAULT true,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
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
CREATE TABLE "org_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	CONSTRAINT "category_per_organization" UNIQUE("organization_id","name")
);
--> statement-breakpoint
CREATE TABLE "org_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"name" varchar(1024),
	"phone" varchar(50),
	"phone_e164" varchar(50),
	"email" varchar(255),
	"email_normalized" text,
	"tags" text[],
	"categories" text[],
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
	"billing_longitude" numeric(9, 6)
);
--> statement-breakpoint
CREATE TABLE "org_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid
);
--> statement-breakpoint
CREATE TABLE "org_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"salutation" varchar(255),
	"name" varchar(1024),
	"phone" varchar(50),
	"phone_e164" varchar(50),
	"email" varchar(255),
	"email_normalized" text,
	"nationality" varchar(255),
	"tags" text[],
	"categories" text[],
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
	"custom_fields" jsonb,
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
CREATE TABLE "org_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"salutation" varchar(255),
	"name" varchar(1024),
	"phone" varchar(50),
	"phone_e164" varchar(50),
	"email" varchar(255),
	"email_normalized" text,
	"nationality" varchar(255),
	"tags" text[],
	"categories" text[],
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
	"organization_id" uuid
);
--> statement-breakpoint
CREATE TABLE "org_email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"name" varchar(255),
	"subject" varchar(998),
	"body" text,
	"org_email_domain_id" uuid,
	"org_email_template_id" uuid,
	"target_categories" text[],
	"status" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "org_email_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"link" text,
	"org_email_id" uuid,
	"org_email_domain_id" uuid
);
--> statement-breakpoint
CREATE TABLE "org_email_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"verified" boolean,
	"email" varchar(255),
	"public" text NOT NULL,
	"secret" text NOT NULL,
	"metadata" jsonb,
	"status" text,
	CONSTRAINT "org_email_domains_public_unique" UNIQUE("public"),
	CONSTRAINT "org_email_domains_secret_unique" UNIQUE("secret")
);
--> statement-breakpoint
CREATE TABLE "org_email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"name" varchar(255),
	"subject" varchar(998),
	"body" text
);
--> statement-breakpoint
CREATE TABLE "org_email_test_receivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"name" varchar(255),
	"emails" text[]
);
--> statement-breakpoint
CREATE TABLE "org_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
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
	"name" text,
	"related_id" uuid,
	"related_type" text,
	"payload" jsonb,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "org_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid,
	"run_by" timestamp with time zone DEFAULT now() NOT NULL,
	"related_id" uuid,
	"related_type" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikeys" ADD CONSTRAINT "apikeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_org_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("org_email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_org_email_template_id_org_email_templates_id_fk" FOREIGN KEY ("org_email_template_id") REFERENCES "public"."org_email_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_org_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("org_email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_email_campaign_id_org_email_campaigns_id_fk" FOREIGN KEY ("email_campaign_id") REFERENCES "public"."org_email_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_email_domain_id_org_email_domains_id_fk" FOREIGN KEY ("email_domain_id") REFERENCES "public"."org_email_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_crm_contact_id_org_contacts_id_fk" FOREIGN KEY ("crm_contact_id") REFERENCES "public"."org_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;