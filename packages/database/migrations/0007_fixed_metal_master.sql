ALTER TABLE "organizations" ADD COLUMN "is_super" boolean;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_is_super_unique" UNIQUE("is_super");