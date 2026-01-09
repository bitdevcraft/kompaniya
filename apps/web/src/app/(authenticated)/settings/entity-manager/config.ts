export interface EntityConfig {
  slug: string;
  label: string;
  description: string;
  entityType: string;
  icon: string;
}

/**
 * Unified entity configuration for Entity Manager
 * Merges entity types from custom attributes and record layouts
 */
export const ENTITY_CONFIGS: EntityConfig[] = [
  {
    slug: "accounts",
    label: "Accounts",
    description: "Companies and organizations",
    entityType: "org_accounts",
    icon: "building",
  },
  {
    slug: "activities",
    label: "Activities",
    description: "Tasks, events, and interactions",
    entityType: "org_activities",
    icon: "calendar",
  },
  {
    slug: "booking-buyers",
    label: "Booking Buyers",
    description: "Real estate booking buyers",
    entityType: "org_real_estate_booking_buyers",
    icon: "users",
  },
  {
    slug: "bookings",
    label: "Real Estate Bookings",
    description: "Property bookings",
    entityType: "org_real_estate_bookings",
    icon: "calendar",
  },
  {
    slug: "campaigns",
    label: "Email Campaigns",
    description: "Email marketing campaigns",
    entityType: "org_email_campaigns",
    icon: "send",
  },
  {
    slug: "categories",
    label: "Categories",
    description: "Classification categories",
    entityType: "org_categories",
    icon: "tags",
  },
  {
    slug: "contacts",
    label: "Contacts",
    description: "People and leads",
    entityType: "org_contacts",
    icon: "user",
  },
  {
    slug: "domains",
    label: "Email Domains",
    description: "Email domain configuration",
    entityType: "org_email_domains",
    icon: "globe",
  },
  {
    slug: "email-clicks",
    label: "Email Clicks",
    description: "Email click tracking data",
    entityType: "org_email_clicks",
    icon: "mouse-pointer",
  },
  {
    slug: "emails",
    label: "Emails",
    description: "Email communications",
    entityType: "org_emails",
    icon: "mail",
  },
  {
    slug: "email-templates",
    label: "Email Templates",
    description: "Reusable email templates",
    entityType: "org_email_templates",
    icon: "file-text",
  },
  {
    slug: "events",
    label: "Events",
    description: "Calendar events",
    entityType: "org_events",
    icon: "calendar",
  },
  {
    slug: "leads",
    label: "Leads",
    description: "Prospective customers",
    entityType: "org_leads",
    icon: "sparkles",
  },
  {
    slug: "opportunities",
    label: "Opportunities",
    description: "Sales deals and pipelines",
    entityType: "org_opportunities",
    icon: "currency",
  },
  {
    slug: "payment-plans",
    label: "Payment Plans",
    description: "Payment installment plans",
    entityType: "org_payment_plans",
    icon: "credit-card",
  },
  {
    slug: "payment-templates",
    label: "Payment Plan Templates",
    description: "Reusable payment plan templates",
    entityType: "org_payment_plan_templates",
    icon: "file-text",
  },
  {
    slug: "properties",
    label: "Real Estate Properties",
    description: "Individual properties",
    entityType: "org_real_estate_properties",
    icon: "home",
  },
  {
    slug: "projects",
    label: "Real Estate Projects",
    description: "Property development projects",
    entityType: "org_real_estate_projects",
    icon: "building",
  },
  {
    slug: "tags",
    label: "Tags",
    description: "Flexible tagging system",
    entityType: "org_tags",
    icon: "tag",
  },
  {
    slug: "tasks",
    label: "Tasks",
    description: "Task management",
    entityType: "org_tasks",
    icon: "check-square",
  },
  {
    slug: "test-receivers",
    label: "Email Test Receivers",
    description: "Email test receivers",
    entityType: "org_email_test_receivers",
    icon: "at-sign",
  },
];

export function getEntityConfig(slug: string): EntityConfig | undefined {
  return ENTITY_CONFIGS.find((entity) => entity.slug === slug);
}

export function getEntityConfigByEntityType(
  entityType: string,
): EntityConfig | undefined {
  return ENTITY_CONFIGS.find((entity) => entity.entityType === entityType);
}
