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
DROP TABLE "org_real_estate_payment-plans" CASCADE;--> statement-breakpoint
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
ALTER TABLE "org_payment_plans" ADD CONSTRAINT "org_payment_plans_template_id_org_payment_plan_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."org_payment_plan_templates"("id") ON DELETE no action ON UPDATE no action;