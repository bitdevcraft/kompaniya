export const RESOURCE_PERMISSION_MAP: Record<string, string> = {
  "/record/leads": "orgLeads",
  "/record/accounts": "orgAccounts",
  "/record/contacts": "orgContacts",
  "/record/opportunities": "orgOpportunities",
  "/record/activities": "orgActivities",
  "/record/projects": "orgRealEstateProjects",
  "/record/properties": "orgRealEstateProperties",
  "/record/bookings": "orgRealEstateBookings",
  "/record/payment-plans": "orgPaymentPlans",
  "/record/payment-plan-templates": "orgPaymentPlanTemplates",
  "/record/email-campaigns": "orgEmailCampaigns",
  "/record/email-templates": "orgEmailTemplates",
  "/record/email-test-receivers": "orgEmailTestReceivers",
} as const;

export type PermissionResource =
  (typeof RESOURCE_PERMISSION_MAP)[keyof typeof RESOURCE_PERMISSION_MAP];

// All organization resources that have view permissions
export const ORG_RECORD_RESOURCES: readonly PermissionResource[] = [
  "orgLeads",
  "orgAccounts",
  "orgContacts",
  "orgOpportunities",
  "orgActivities",
  "orgRealEstateProjects",
  "orgRealEstateProperties",
  "orgRealEstateBookings",
  "orgPaymentPlans",
  "orgPaymentPlanTemplates",
  "orgEmailCampaigns",
  "orgEmailTemplates",
  "orgEmailTestReceivers",
] as const;
