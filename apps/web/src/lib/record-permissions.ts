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
  "/record/email-domains": "orgEmailDomains",
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
  "orgEmailDomains",
  "orgEmailTemplates",
  "orgEmailTestReceivers",
] as const;

// Settings routes that require "access" permission
export const SETTINGS_PERMISSION_MAP: Record<string, string> = {
  "/settings/organization": "settingsOrganization",
  "/settings/email-setup": "settingsEmailSetup",
  "/settings/entity-manager": "settingsEntityManager",
  "/settings/tags": "settingsTags",
} as const;

export type SettingsPermissionResource =
  (typeof SETTINGS_PERMISSION_MAP)[keyof typeof SETTINGS_PERMISSION_MAP];

// All settings resources that have access permissions
export const SETTINGS_RESOURCES: readonly SettingsPermissionResource[] = [
  "settingsOrganization",
  "settingsEmailSetup",
  "settingsEntityManager",
  "settingsTags",
] as const;
