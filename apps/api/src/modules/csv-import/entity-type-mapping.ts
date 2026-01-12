/**
 * Mapping between CSV import table IDs and custom field entity types
 *
 * CSV import uses camelCase (e.g., orgContacts) while custom field definitions
 * use snake_case (e.g., org_contacts). This mapping bridges the two conventions.
 */
export const TABLE_ID_TO_ENTITY_TYPE: Record<string, string> = {
  orgAccounts: 'org_accounts',
  orgActivities: 'org_activities',
  orgCategories: 'org_categories',
  orgContacts: 'org_contacts',
  orgLeads: 'org_leads',
  orgOpportunities: 'org_opportunities',
  orgRealEstateBookings: 'org_real_estate_bookings',
  orgRealEstateProjects: 'org_real_estate_projects',
  orgRealEstateProperties: 'org_real_estate_properties',
};
