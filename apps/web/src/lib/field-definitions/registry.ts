import type { RecordLayoutEntityType } from "@repo/database";

import type { NativeFieldDefinition } from "./types";

import { COMMON_SYSTEM_FIELDS } from "./base/common-fields";
// Import entity field definitions
import { orgAccountsFields } from "./org-accounts.fields";
import { orgActivitiesFields } from "./org-activities.fields";
import { orgCategoriesFields } from "./org-categories.fields";
import { orgContactsFields } from "./org-contacts.fields";
import { orgEmailCampaignsFields } from "./org-email-campaigns.fields";
import { orgEmailDomainsFields } from "./org-email-domains.fields";
import { orgEmailTemplatesFields } from "./org-email-templates.fields";
import { orgEventsFields } from "./org-events.fields";
import { orgLeadsFields } from "./org-leads.fields";
import { orgOpportunitiesFields } from "./org-opportunities.fields";
import { orgPaymentPlanTemplatesFields } from "./org-payment-plan-templates.fields";
import { orgPaymentPlansFields } from "./org-payment-plans.fields";
import { orgRealEstateBookingsFields } from "./org-real-estate-bookings.fields";
import { orgRealEstateProjectsFields } from "./org-real-estate-projects.fields";
import { orgRealEstatePropertiesFields } from "./org-real-estate-properties.fields";
import { orgTagsFields } from "./org-tags.fields";
import { orgTasksFields } from "./org-tasks.fields";

/**
 * Field definitions registry
 * Maps entity types to their native field definitions
 */
const FIELD_DEFINITIONS_REGISTRY: Partial<
  Record<RecordLayoutEntityType, NativeFieldDefinition[]>
> = {
  org_contacts: orgContactsFields,
  org_leads: orgLeadsFields,
  org_accounts: orgAccountsFields,
  org_opportunities: orgOpportunitiesFields,
  org_activities: orgActivitiesFields,
  org_categories: orgCategoriesFields,
  org_tags: orgTagsFields,
  org_events: orgEventsFields,
  org_tasks: orgTasksFields,
  org_email_templates: orgEmailTemplatesFields,
  org_email_campaigns: orgEmailCampaignsFields,
  org_email_domains: orgEmailDomainsFields,
  org_real_estate_projects: orgRealEstateProjectsFields,
  org_real_estate_properties: orgRealEstatePropertiesFields,
  org_real_estate_bookings: orgRealEstateBookingsFields,
  org_payment_plans: orgPaymentPlansFields,
  org_payment_plan_templates: orgPaymentPlanTemplatesFields,
};

/**
 * Get all entity types that have field definitions
 */
export function getEntityTypesWithDefinitions(): RecordLayoutEntityType[] {
  return Object.keys(FIELD_DEFINITIONS_REGISTRY) as RecordLayoutEntityType[];
}

/**
 * Get native field definitions for an entity type
 * Returns system fields + entity-specific fields
 */
export function getFieldDefinitions(
  entityType: string,
): NativeFieldDefinition[] {
  const entityFields =
    FIELD_DEFINITIONS_REGISTRY[
      entityType as keyof typeof FIELD_DEFINITIONS_REGISTRY
    ] || [];

  // Merge common system fields with entity-specific fields
  return [...COMMON_SYSTEM_FIELDS, ...entityFields];
}

/**
 * Check if an entity type has field definitions
 */
export function hasFieldDefinitions(entityType: string): boolean {
  return entityType in FIELD_DEFINITIONS_REGISTRY;
}
