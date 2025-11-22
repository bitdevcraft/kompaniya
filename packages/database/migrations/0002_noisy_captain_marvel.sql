CREATE TYPE "public"."org_real_estate_booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_booking_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_project_status" AS ENUM('planning', 'active', 'completed', 'on_hold', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_property_listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_property_status" AS ENUM('available', 'reserved', 'sold', 'rented', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."org_real_estate_property_type" AS ENUM('unit', 'plot', 'villa', 'apartment', 'other');--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "reference_code" varchar(100);--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "booking_type" "org_real_estate_booking_type";--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "status" "org_real_estate_booking_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "currency_code" varchar(3);--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "deposit_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "expected_completion_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "contract_signed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "org_real_estate_bookings" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "developer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "status" "org_real_estate_project_status" DEFAULT 'planning';--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "launch_year" integer;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "expected_completion_year" integer;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "total_units" integer;--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "city" varchar(150);--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "state" varchar(150);--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "country" varchar(150);--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "address_line_1" varchar(255);--> statement-breakpoint
ALTER TABLE "org_real_estate_projects" ADD COLUMN "address_line_2" varchar(255);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "property_code" varchar(100);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "property_type" "org_real_estate_property_type";--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "listing_type" "org_real_estate_property_listing_type";--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "status" "org_real_estate_property_status" DEFAULT 'available';--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "bedrooms" integer;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "bathrooms" integer;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "floor" varchar(50);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "area" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "area_unit" varchar(50);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "address_line_1" varchar(255);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "address_line_2" varchar(255);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "city" varchar(150);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "state" varchar(150);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "country" varchar(150);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "asking_price" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "asking_rent" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "currency_code" varchar(3);--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "is_furnished" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "org_real_estate_properties" ADD COLUMN "parking_spots" integer;