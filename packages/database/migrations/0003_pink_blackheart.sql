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
	"bookingId" uuid,
	"contactId" uuid,
	"is_primary_buyer" boolean DEFAULT false,
	CONSTRAINT "buyers" UNIQUE("bookingId","contactId")
);
--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_bookingId_org_real_estate_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."org_real_estate_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_real_estate_booking_buyers" ADD CONSTRAINT "org_real_estate_booking_buyers_contactId_org_contacts_id_fk" FOREIGN KEY ("contactId") REFERENCES "public"."org_contacts"("id") ON DELETE cascade ON UPDATE no action;