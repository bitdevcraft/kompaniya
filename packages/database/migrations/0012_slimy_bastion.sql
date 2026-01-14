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
ALTER TABLE "org_email_bounce_events" ADD CONSTRAINT "org_email_bounce_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_click_events" ADD CONSTRAINT "org_email_click_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_click_events" ADD CONSTRAINT "org_email_click_events_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_complaint_events" ADD CONSTRAINT "org_email_complaint_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_delivery_delay_events" ADD CONSTRAINT "org_email_delivery_delay_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_delivery_events" ADD CONSTRAINT "org_email_delivery_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_open_events" ADD CONSTRAINT "org_email_open_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_open_events" ADD CONSTRAINT "org_email_open_events_org_email_id_org_emails_id_fk" FOREIGN KEY ("org_email_id") REFERENCES "public"."org_emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_reject_events" ADD CONSTRAINT "org_email_reject_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_rendering_failure_events" ADD CONSTRAINT "org_email_rendering_failure_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_email_send_events" ADD CONSTRAINT "org_email_send_events_org_email_event_id_org_email_events_id_fk" FOREIGN KEY ("org_email_event_id") REFERENCES "public"."org_email_events"("id") ON DELETE no action ON UPDATE no action;