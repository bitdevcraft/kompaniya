ALTER TABLE "org_email_campaigns" DROP CONSTRAINT "org_email_campaigns_org_email_template_id_org_email_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "org_email_campaigns" ADD CONSTRAINT "org_email_campaigns_org_email_template_id_org_email_templates_id_fk" FOREIGN KEY ("org_email_template_id") REFERENCES "public"."org_email_templates"("id") ON DELETE set null ON UPDATE no action;