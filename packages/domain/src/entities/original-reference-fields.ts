import type { RecordLayoutEntityType } from "./record-layout-entity-type.js";

export interface OriginalReferenceField {
  sourceEntityType: RecordLayoutEntityType;
  fieldName: string;
  label: string;
  apiPath: string;
  recordPath: string;
}

export const ORIGINAL_REFERENCE_FIELDS: Partial<
  Record<RecordLayoutEntityType, OriginalReferenceField[]>
> = {
  org_accounts: [
    {
      sourceEntityType: "org_opportunities",
      fieldName: "accountId",
      label: "Opportunities",
      apiPath: "opportunity",
      recordPath: "opportunities",
    },
  ],
  org_contacts: [
    {
      sourceEntityType: "org_opportunities",
      fieldName: "primaryContactId",
      label: "Opportunities (Primary)",
      apiPath: "opportunity",
      recordPath: "opportunities",
    },
    {
      sourceEntityType: "org_real_estate_booking_buyers",
      fieldName: "contactId",
      label: "Booking Buyers",
      apiPath: "booking-buyer",
      recordPath: "booking-buyers",
    },
    {
      sourceEntityType: "org_emails",
      fieldName: "crmContactId",
      label: "Emails",
      apiPath: "email",
      recordPath: "emails",
    },
  ],
  org_real_estate_projects: [
    {
      sourceEntityType: "org_real_estate_bookings",
      fieldName: "projectId",
      label: "Bookings",
      apiPath: "real-estate/booking",
      recordPath: "bookings",
    },
    {
      sourceEntityType: "org_real_estate_properties",
      fieldName: "projectId",
      label: "Properties",
      apiPath: "real-estate/property",
      recordPath: "properties",
    },
  ],
  org_real_estate_properties: [
    {
      sourceEntityType: "org_real_estate_bookings",
      fieldName: "propertyId",
      label: "Bookings",
      apiPath: "real-estate/booking",
      recordPath: "bookings",
    },
  ],
  org_payment_plans: [
    {
      sourceEntityType: "org_real_estate_bookings",
      fieldName: "paymentPlanId",
      label: "Bookings",
      apiPath: "real-estate/booking",
      recordPath: "bookings",
    },
  ],
  org_payment_plan_templates: [
    {
      sourceEntityType: "org_payment_plans",
      fieldName: "templateId",
      label: "Payment Plans",
      apiPath: "payment-plan",
      recordPath: "payment-plans",
    },
  ],
  org_real_estate_bookings: [
    {
      sourceEntityType: "org_real_estate_booking_buyers",
      fieldName: "bookingId",
      label: "Buyers",
      apiPath: "booking-buyer",
      recordPath: "booking-buyers",
    },
  ],
  org_email_campaigns: [
    {
      sourceEntityType: "org_emails",
      fieldName: "emailCampaignId",
      label: "Emails",
      apiPath: "email",
      recordPath: "emails",
    },
  ],
  org_email_domains: [
    {
      sourceEntityType: "org_emails",
      fieldName: "emailDomainId",
      label: "Emails",
      apiPath: "email",
      recordPath: "emails",
    },
    {
      sourceEntityType: "org_email_campaigns",
      fieldName: "orgEmailDomainId",
      label: "Email Campaigns",
      apiPath: "email-campaign",
      recordPath: "email-campaigns",
    },
    {
      sourceEntityType: "org_email_clicks",
      fieldName: "orgEmailDomainId",
      label: "Email Clicks",
      apiPath: "email-click",
      recordPath: "email-clicks",
    },
  ],
  org_email_templates: [
    {
      sourceEntityType: "org_email_campaigns",
      fieldName: "orgEmailTemplateId",
      label: "Email Campaigns",
      apiPath: "email-campaign",
      recordPath: "email-campaigns",
    },
  ],
  org_email_test_receivers: [
    {
      sourceEntityType: "org_email_campaigns",
      fieldName: "orgEmailTestReceiverId",
      label: "Email Campaigns",
      apiPath: "email-campaign",
      recordPath: "email-campaigns",
    },
  ],
  org_emails: [
    {
      sourceEntityType: "org_email_clicks",
      fieldName: "orgEmailId",
      label: "Email Clicks",
      apiPath: "email-click",
      recordPath: "email-clicks",
    },
  ],
  // Entities with no original references - empty arrays for completeness
  org_activities: [],
  org_categories: [],
  org_tags: [],
  org_tasks: [],
  org_events: [],
  org_leads: [],
  org_opportunities: [],
  org_email_clicks: [],
  org_real_estate_booking_buyers: [],
};
