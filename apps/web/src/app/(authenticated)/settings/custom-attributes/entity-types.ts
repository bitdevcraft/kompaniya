export type CustomAttributeEntity = {
  slug: string;
  label: string;
  entityType: string;
};

export const customAttributeEntities: CustomAttributeEntity[] = [
  { slug: "accounts", label: "Accounts", entityType: "org_accounts" },
  { slug: "activities", label: "Activities", entityType: "org_activities" },
  {
    slug: "booking-buyers",
    label: "Booking Buyers",
    entityType: "org_real_estate_booking_buyers",
  },
  {
    slug: "bookings",
    label: "Bookings",
    entityType: "org_real_estate_bookings",
  },
  { slug: "campaigns", label: "Campaigns", entityType: "org_email_campaigns" },
  { slug: "categories", label: "Categories", entityType: "org_categories" },
  { slug: "contacts", label: "Contacts", entityType: "org_contacts" },
  { slug: "domains", label: "Email Domains", entityType: "org_email_domains" },
  {
    slug: "email-clicks",
    label: "Email Clicks",
    entityType: "org_email_clicks",
  },
  { slug: "emails", label: "Emails", entityType: "org_emails" },
  {
    slug: "email-templates",
    label: "Email Templates",
    entityType: "org_email_templates",
  },
  { slug: "events", label: "Events", entityType: "org_events" },
  { slug: "leads", label: "Leads", entityType: "org_leads" },
  {
    slug: "opportunities",
    label: "Opportunities",
    entityType: "org_opportunities",
  },
  {
    slug: "payment-plans",
    label: "Payment Plans",
    entityType: "org_payment_plans",
  },
  {
    slug: "payment-templates",
    label: "Payment Templates",
    entityType: "org_payment_plan_templates",
  },
  {
    slug: "properties",
    label: "Properties",
    entityType: "org_real_estate_properties",
  },
  {
    slug: "projects",
    label: "Projects",
    entityType: "org_real_estate_projects",
  },
  { slug: "tasks", label: "Tasks", entityType: "org_tasks" },
  {
    slug: "test-receivers",
    label: "Test Receivers",
    entityType: "org_email_test_receivers",
  },
];

export const getCustomAttributeEntity = (slug: string) =>
  customAttributeEntities.find((entity) => entity.slug === slug);
