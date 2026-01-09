/**
 * Entity metadata configuration
 */
export interface EntityMetadata {
  value: RecordLayoutEntityType;
  label: string;
  description: string;
  iconName?: string;
}

/**
 * All entity types that support record layouts
 * This is the source of truth for valid entity types
 */
export type RecordLayoutEntityType =
  | "org_contacts"
  | "org_leads"
  | "org_accounts"
  | "org_opportunities"
  | "org_activities"
  | "org_categories"
  | "org_tags"
  | "org_events"
  | "org_tasks"
  | "org_email_templates"
  | "org_email_campaigns"
  | "org_email_domains"
  | "org_real_estate_projects"
  | "org_real_estate_properties"
  | "org_real_estate_bookings"
  | "org_payment_plans"
  | "org_payment_plan_templates"
  | "org_email_test_receivers"
  | "org_emails"
  | "org_email_clicks"
  | "org_real_estate_booking_buyers";
