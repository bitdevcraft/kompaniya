ALTER TABLE "org_real_estate_bookings" ADD COLUMN "payment_plan_id" uuid;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD CONSTRAINT "org_real_estate_bookings_payment_plan_id_org_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."org_payment_plans"("id") ON DELETE set null;--> statement-breakpoint
