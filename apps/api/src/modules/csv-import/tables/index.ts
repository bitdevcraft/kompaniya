import {
  orgAccountsTable,
  orgActivitiesTable,
  orgCategoriesTable,
  orgContactsTable,
  orgLeadsTable,
  orgOpportunitiesTable,
  orgRealEstateBookingsTable,
  orgRealEstatePaymentPlansTable,
  orgRealEstateProjectsTable,
  orgRealEstatePropertiesTable,
} from '@repo/database/schema';

import type { CsvImportTableConfig } from '../csv-import.types';

import {
  ORG_ACCOUNTS_COLUMNS,
  ORG_ACTIVITIES_COLUMNS,
  ORG_CATEGORIES_COLUMNS,
  ORG_CONTACTS_COLUMNS,
  ORG_LEADS_COLUMNS,
  ORG_OPPORTUNITIES_COLUMNS,
  ORG_REAL_ESTATE_BOOKINGS_COLUMNS,
  ORG_REAL_ESTATE_PAYMENT_PLANS_COLUMNS,
  ORG_REAL_ESTATE_PROJECTS_COLUMNS,
  ORG_REAL_ESTATE_PROPERTIES_COLUMNS,
} from '../columns';

export const CSV_IMPORT_TABLES: Record<string, CsvImportTableConfig> = {
  orgAccounts: {
    id: 'orgAccounts',
    label: 'Organization Accounts',
    description: 'Import CSV data into the organization accounts table.',
    table: orgAccountsTable,
    columns: ORG_ACCOUNTS_COLUMNS,
  },
  orgActivities: {
    id: 'orgActivities',
    label: 'Organization Activities',
    description: 'Import CSV data into the organization activities table.',
    table: orgActivitiesTable,
    columns: ORG_ACTIVITIES_COLUMNS,
  },
  orgCategories: {
    id: 'orgCategories',
    label: 'Organization Categories',
    description: 'Import CSV data into the organization categories table.',
    table: orgCategoriesTable,
    columns: ORG_CATEGORIES_COLUMNS,
  },
  orgContacts: {
    id: 'orgContacts',
    label: 'Organization Contacts',
    description: 'Import CSV data into the organization contacts table.',
    table: orgContactsTable,
    columns: ORG_CONTACTS_COLUMNS,
  },
  orgLeads: {
    id: 'orgLeads',
    label: 'Organization Leads',
    description: 'Import CSV data into the organization leads table.',
    table: orgLeadsTable,
    columns: ORG_LEADS_COLUMNS,
  },
  orgOpportunities: {
    id: 'orgOpportunities',
    label: 'Organization Opportunities',
    description: 'Import CSV data into the organization opportunities table.',
    table: orgOpportunitiesTable,
    columns: ORG_OPPORTUNITIES_COLUMNS,
  },
  orgRealEstateBookings: {
    id: 'orgRealEstateBookings',
    label: 'Organization Real Estate Bookings',
    description:
      'Import CSV data into the organization real estate bookings table.',
    table: orgRealEstateBookingsTable,
    columns: ORG_REAL_ESTATE_BOOKINGS_COLUMNS,
  },
  orgRealEstatePaymentPlans: {
    id: 'orgRealEstatePaymentPlans',
    label: 'Organization Real Estate Payment Plans',
    description:
      'Import CSV data into the organization real estate payment plans table.',
    table: orgRealEstatePaymentPlansTable,
    columns: ORG_REAL_ESTATE_PAYMENT_PLANS_COLUMNS,
  },
  orgRealEstateProjects: {
    id: 'orgRealEstateProjects',
    label: 'Organization Real Estate Projects',
    description:
      'Import CSV data into the organization real estate projects table.',
    table: orgRealEstateProjectsTable,
    columns: ORG_REAL_ESTATE_PROJECTS_COLUMNS,
  },
  orgRealEstateProperties: {
    id: 'orgRealEstateProperties',
    label: 'Organization Real Estate Properties',
    description:
      'Import CSV data into the organization real estate properties table.',
    table: orgRealEstatePropertiesTable,
    columns: ORG_REAL_ESTATE_PROPERTIES_COLUMNS,
  },
};
