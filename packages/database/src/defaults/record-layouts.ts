/**
 * Default record layouts for each entity type
 *
 * These layouts are used as defaults when seeding new organizations.
 * The structure matches the RecordPageLayout interface from the web app.
 *
 * Individual entity layouts are defined in the layouts/ directory.
 */

import {
  orgAccountsLayout,
  orgActivitiesLayout,
  orgCategoriesLayout,
  orgContactsLayout,
  orgEmailCampaignsLayout,
  orgEmailClickEventsLayout,
  orgEmailDomainsLayout,
  orgEmailsLayout,
  orgEmailTemplatesLayout,
  orgEmailTestReceiversLayout,
  orgEventsLayout,
  orgLeadsLayout,
  orgOpportunitiesLayout,
  orgPaymentPlansLayout,
  orgPaymentPlanTemplatesLayout,
  orgRealEstateBookingBuyersLayout,
  orgRealEstateBookingsLayout,
  orgRealEstateProjectsLayout,
  orgRealEstatePropertiesLayout,
  orgTagsLayout,
  orgTasksLayout,
} from "./layouts";

/**
 * Default record layouts for each entity type
 */
export const DEFAULT_RECORD_LAYOUTS = {
  org_contacts: orgContactsLayout,
  org_leads: orgLeadsLayout,
  org_accounts: orgAccountsLayout,
  org_opportunities: orgOpportunitiesLayout,
  org_activities: orgActivitiesLayout,
  org_categories: orgCategoriesLayout,
  org_tags: orgTagsLayout,
  org_events: orgEventsLayout,
  org_tasks: orgTasksLayout,
  org_email_templates: orgEmailTemplatesLayout,
  org_email_campaigns: orgEmailCampaignsLayout,
  org_email_domains: orgEmailDomainsLayout,
  org_email_test_receivers: orgEmailTestReceiversLayout,
  org_emails: orgEmailsLayout,
  org_email_clicks: orgEmailClickEventsLayout, // Note: org_email_click_events in DB
  org_real_estate_projects: orgRealEstateProjectsLayout,
  org_real_estate_properties: orgRealEstatePropertiesLayout,
  org_real_estate_bookings: orgRealEstateBookingsLayout,
  org_real_estate_booking_buyers: orgRealEstateBookingBuyersLayout,
  org_payment_plans: orgPaymentPlansLayout,
  org_payment_plan_templates: orgPaymentPlanTemplatesLayout,
} as const;

/**
 * Entity type that has a default layout
 */
export type DefaultLayoutEntityType = keyof typeof DEFAULT_RECORD_LAYOUTS;
