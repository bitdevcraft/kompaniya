import type { RecordLayoutEntityType } from "@repo/database";

export interface EntityTypeConfig {
  value: RecordLayoutEntityType;
  label: string;
  description: string;
  icon?: string;
}

/**
 * Entity type configurations for the record layout builder
 */
export const ENTITY_TYPES: EntityTypeConfig[] = [
  {
    value: "org_contacts",
    label: "Contacts",
    description: "People and leads",
    icon: "user",
  },
  {
    value: "org_leads",
    label: "Leads",
    description: "Prospective customers",
    icon: "sparkles",
  },
  {
    value: "org_accounts",
    label: "Accounts",
    description: "Companies and organizations",
    icon: "building",
  },
  {
    value: "org_opportunities",
    label: "Opportunities",
    description: "Sales deals and pipelines",
    icon: "currency",
  },
  {
    value: "org_activities",
    label: "Activities",
    description: "Tasks, events, and interactions",
    icon: "calendar",
  },
  {
    value: "org_categories",
    label: "Categories",
    description: "Classification categories",
    icon: "tags",
  },
  {
    value: "org_tags",
    label: "Tags",
    description: "Flexible tagging system",
    icon: "tag",
  },
  {
    value: "org_events",
    label: "Events",
    description: "Calendar events",
    icon: "calendar",
  },
  {
    value: "org_tasks",
    label: "Tasks",
    description: "Task management",
    icon: "check-square",
  },
  {
    value: "org_email_templates",
    label: "Email Templates",
    description: "Reusable email templates",
    icon: "mail",
  },
  {
    value: "org_email_campaigns",
    label: "Email Campaigns",
    description: "Email marketing campaigns",
    icon: "send",
  },
  {
    value: "org_email_domains",
    label: "Email Domains",
    description: "Email domain configuration",
    icon: "globe",
  },
  {
    value: "org_real_estate_projects",
    label: "Real Estate Projects",
    description: "Property development projects",
    icon: "building",
  },
  {
    value: "org_real_estate_properties",
    label: "Real Estate Properties",
    description: "Individual properties",
    icon: "home",
  },
  {
    value: "org_real_estate_bookings",
    label: "Real Estate Bookings",
    description: "Property bookings",
    icon: "calendar",
  },
  {
    value: "org_payment_plans",
    label: "Payment Plans",
    description: "Payment installment plans",
    icon: "credit-card",
  },
  {
    value: "org_payment_plan_templates",
    label: "Payment Plan Templates",
    description: "Reusable payment plan templates",
    icon: "file-text",
  },
];

export function getEntityTypeConfig(
  entityType: string,
): EntityTypeConfig | undefined {
  return ENTITY_TYPES.find((t) => t.value === entityType);
}
