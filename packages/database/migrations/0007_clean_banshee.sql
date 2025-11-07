ALTER TABLE "org_accounts" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_activities" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_activities" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_activities" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_categories" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_categories" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_categories" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_emails" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_emails" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_emails" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_events" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_events" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_events" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_leads" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_leads" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_leads" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_accounts" ADD CONSTRAINT "org_accounts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_activities" ADD CONSTRAINT "org_activities_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_categories" ADD CONSTRAINT "org_categories_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_contacts" ADD CONSTRAINT "org_contacts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_clicks" ADD CONSTRAINT "org_email_clicks_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_domains" ADD CONSTRAINT "org_email_domains_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_templates" ADD CONSTRAINT "org_email_templates_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_test_receivers" ADD CONSTRAINT "org_email_test_receivers_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_emails" ADD CONSTRAINT "org_emails_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_events" ADD CONSTRAINT "org_events_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_leads" ADD CONSTRAINT "org_leads_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_opportunities" ADD CONSTRAINT "org_opportunities_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD CONSTRAINT "org_real_estate_payment-plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD CONSTRAINT "org_real_estate_payment-plans_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_payment-plans" ADD CONSTRAINT "org_real_estate_payment-plans_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD CONSTRAINT "org_real_estate_projects_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD CONSTRAINT "org_real_estate_properties_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;