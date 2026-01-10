import { RecordLayoutEntityType } from "./record-layout-entity-type.js";

/**
 * Configuration for entity reference fields
 * Maps entity types to their API and record paths for auto-generating endpoints
 */
export interface EntityReferenceConfig {
  /** The entity type identifier */
  entityType: RecordLayoutEntityType;
  /** URL-friendly slug for the entity */
  slug: string;
  /** Display label for the entity */
  label: string;
  /** API path segment (e.g., "contact" for /api/organization/contact) */
  apiPath: string;
  /** Record path segment (e.g., "crm/contacts" for /record/crm/contacts/r/:id) */
  recordPath: string;
}

/**
 * Complete mapping of all org entities to their reference configurations
 * This is the source of truth for generating reference field endpoints
 */
export const ENTITY_REFERENCE_CONFIGS: EntityReferenceConfig[] = [
  // CRM Module
  {
    entityType: "org_contacts",
    slug: "contacts",
    label: "Contacts",
    apiPath: "contact",
    recordPath: "contacts",
  },
  {
    entityType: "org_leads",
    slug: "leads",
    label: "Leads",
    apiPath: "lead",
    recordPath: "leads",
  },
  {
    entityType: "org_accounts",
    slug: "accounts",
    label: "Accounts",
    apiPath: "account",
    recordPath: "accounts",
  },
  {
    entityType: "org_opportunities",
    slug: "opportunities",
    label: "Opportunities",
    apiPath: "opportunity",
    recordPath: "opportunities",
  },
  {
    entityType: "org_activities",
    slug: "activities",
    label: "Activities",
    apiPath: "activity",
    recordPath: "activities",
  },
  {
    entityType: "org_categories",
    slug: "categories",
    label: "Categories",
    apiPath: "category",
    recordPath: "categories",
  },
  {
    entityType: "org_tags",
    slug: "tags",
    label: "Tags",
    apiPath: "tag",
    recordPath: "tags",
  },
  {
    entityType: "org_events",
    slug: "events",
    label: "Events",
    apiPath: "event",
    recordPath: "events",
  },
  {
    entityType: "org_tasks",
    slug: "tasks",
    label: "Tasks",
    apiPath: "task",
    recordPath: "tasks",
  },
  // Marketing Module
  {
    entityType: "org_email_templates",
    slug: "email-templates",
    label: "Email Templates",
    apiPath: "email-template",
    recordPath: "email-templates",
  },
  {
    entityType: "org_email_campaigns",
    slug: "email-campaigns",
    label: "Email Campaigns",
    apiPath: "email-campaign",
    recordPath: "email-campaigns",
  },
  {
    entityType: "org_email_domains",
    slug: "email-domains",
    label: "Email Domains",
    apiPath: "email-domain",
    recordPath: "email-domains",
  },
  {
    entityType: "org_emails",
    slug: "emails",
    label: "Emails",
    apiPath: "email",
    recordPath: "emails",
  },
  {
    entityType: "org_email_clicks",
    slug: "email-clicks",
    label: "Email Clicks",
    apiPath: "email-click",
    recordPath: "email-clicks",
  },
  {
    entityType: "org_email_test_receivers",
    slug: "email-test-receivers",
    label: "Email Test Receivers",
    apiPath: "email-test-receiver",
    recordPath: "email-test-receivers",
  },
  // Real Estate Module
  {
    entityType: "org_real_estate_projects",
    slug: "real-estate-projects",
    label: "Real Estate Projects",
    apiPath: "real-estate/project",
    recordPath: "projects",
  },
  {
    entityType: "org_real_estate_properties",
    slug: "real-estate-properties",
    label: "Real Estate Properties",
    apiPath: "real-estate/property",
    recordPath: "properties",
  },
  {
    entityType: "org_real_estate_bookings",
    slug: "real-estate-bookings",
    label: "Real Estate Bookings",
    apiPath: "real-estate/booking",
    recordPath: "bookings",
  },
  {
    entityType: "org_payment_plans",
    slug: "payment-plans",
    label: "Payment Plans",
    apiPath: "payment-plan",
    recordPath: "payment-plans",
  },
  {
    entityType: "org_payment_plan_templates",
    slug: "payment-plan-templates",
    label: "Payment Plan Templates",
    apiPath: "payment-plan-template",
    recordPath: "payment-plan-templates",
  },
  {
    entityType: "org_real_estate_booking_buyers",
    slug: "booking-buyers",
    label: "Booking Buyers",
    apiPath: "booking-buyer",
    recordPath: "booking-buyers",
  },
];

/**
 * Generate reference field endpoints from entity config
 * Returns the search, findById, and redirect URLs for a reference field
 * @param config - The entity reference configuration
 * @param baseUrl - The base URL for API endpoints (e.g., "http://localhost:3000")
 */
export function generateReferenceEndpoints(
  config: EntityReferenceConfig,
  baseUrl: string,
): {
  searchEndpoint: string;
  findByIdEndpoint: string;
  redirectBaseUrl: string;
} {
  return {
    findByIdEndpoint: `${baseUrl}/api/organization/${config.apiPath}/r/:id`,
    redirectBaseUrl: `/record/${config.recordPath}/r/:id`,
    searchEndpoint: `${baseUrl}/api/organization/${config.apiPath}/paginated`,
  };
}

/**
 * Get entity reference config by entity type
 */
export function getEntityReferenceConfig(
  entityType: RecordLayoutEntityType,
): EntityReferenceConfig | undefined {
  return ENTITY_REFERENCE_CONFIGS.find(
    (config) => config.entityType === entityType,
  );
}

/**
 * Get entity reference config by slug
 */
export function getEntityReferenceConfigBySlug(
  slug: string,
): EntityReferenceConfig | undefined {
  return ENTITY_REFERENCE_CONFIGS.find((config) => config.slug === slug);
}
