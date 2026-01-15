/**
 * Default record layouts for each entity type
 *
 * These layouts are used as defaults when seeding new organizations.
 * The structure matches the RecordPageLayout interface from the web app.
 *
 * Note: These are simplified defaults. The web app has more detailed layouts
 * that can be synced to the database in the future.
 */

import type {
  RecordLayoutHeader,
  RecordLayoutSectionColumns,
} from "../schema/org-models/org-record-layouts";

/**
 * Base default layout structure that applies to most entities
 */
const baseDefaultLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled record" },
    metadata: [
      {
        fieldId: "createdAt",
        id: "created-at",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "updated-at",
        label: "Updated",
        type: "datetime",
      },
    ],
  } satisfies RecordLayoutHeader,
  sectionColumns: {
    header: {
      sections: [
        {
          id: "overview",
          title: "Overview",
          fields: [
            { id: "name", label: "Name", type: "text" },
            { id: "notes", label: "Notes", type: "textarea" },
          ],
        },
      ],
    },
  } satisfies RecordLayoutSectionColumns,
  supplementalFields: [],
};

const OPPORTUNITY_TYPES = [
  { label: "New business", value: "new_business" },
  { label: "Renewal", value: "renewal" },
  { label: "Upsell", value: "upsell" },
  { label: "Cross-sell", value: "cross_sell" },
];

const OPPORTUNITY_STATUS = [
  { label: "Open", value: "open" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
  { label: "On hold", value: "on_hold" },
];

const OPPORTUNITY_PRIORITY = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const FORECAST_CATEGORIES = [
  { label: "Pipeline", value: "pipeline" },
  { label: "Best case", value: "best_case" },
  { label: "Commit", value: "commit" },
  { label: "Omitted", value: "omitted" },
  { label: "Closed", value: "closed" },
];
/**
 * Default record layouts for each entity type
 */
export const DEFAULT_RECORD_LAYOUTS = {
  org_contacts: {
    header: {
      avatar: {
        fallbackFieldId: "name",
        imageFieldId: "avatarUrl",
      },
      chips: [
        {
          fieldId: "email",
          icon: "mail",
          id: "email-chip",
          linkType: "mailto",
        },
        {
          fieldId: "phone",
          icon: "phone",
          id: "phone-chip",
          linkType: "tel",
        },
        {
          fieldId: "websiteUrl",
          icon: "globe",
          id: "website-chip",
          linkType: "url",
        },
      ],
      metadata: [
        {
          fieldId: "createdAt",
          id: "created-at",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "updated-at",
          label: "Updated",
          type: "datetime",
        },
        {
          fieldId: "lastActivityAt",
          id: "last-activity",
          label: "Last activity",
          type: "datetime",
        },
      ],
      subtitle: [
        {
          fieldId: "companyName",
        },
        {
          fieldId: "languagePref",
          prefix: "Language: ",
        },
      ],
      title: {
        fallback: "Unnamed contact",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Key identifiers that appear across the CRM, email campaigns, and automation workflows.",
            fields: [
              { id: "lastName", label: "First name", type: "text" },
              { id: "firstName", label: "Last name", type: "text" },
              { id: "salutation", label: "Salutation", type: "text" },
              { id: "companyName", label: "Company", type: "text" },
              {
                id: "email",
                label: "Email",
                placeholder: "name@example.com",
                type: "text",
              },
              {
                id: "phone",
                label: "Phone",
                placeholder: "+1 (555) 000-0000",
                type: "phone",
              },
              {
                id: "websiteUrl",
                label: "Website",
                placeholder: "https://",
                type: "text",
              },
              { id: "linkedinUrl", label: "LinkedIn", type: "text" },
              { id: "twitterHandle", label: "Twitter", type: "text" },
              {
                id: "languagePref",
                label: "Language preference",
                type: "text",
              },
              { id: "nationality", label: "Nationality", type: "text" },
              { id: "score", label: "Engagement score", type: "number" },
              { id: "birthday", label: "Birthday", type: "date" },
            ],
            id: "profile",
            title: "Profile",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description:
              "Classify the contact for list building, segmentation, and personalization.",
            fields: [
              {
                colSpan: 2,
                description:
                  "Comma or line separated tags make it easy to drive automations.",
                id: "tags",
                label: "Tags",
                placeholder: "Add tags…",
                tag: {
                  relatedType: "contact",
                },
                type: "tag",
              },

              { id: "industry", label: "Industry", type: "text" },
              { id: "annualRevenueBand", label: "Revenue band", type: "text" },
              { id: "employeeCountBand", label: "Company size", type: "text" },
            ],
            id: "segmentation",
            title: "Segmentation",
          },
          {
            description:
              "How this contact prefers to hear from us and their current consent status.",
            fields: [
              { id: "emailOptIn", label: "Email opt-in", type: "boolean" },
              { id: "smsOptIn", label: "SMS opt-in", type: "boolean" },
              { id: "phoneOptIn", label: "Phone opt-in", type: "boolean" },
              { id: "doNotContact", label: "Do not contact", type: "boolean" },
              { id: "doNotSell", label: "Do not sell", type: "boolean" },
              {
                id: "emailConfirmedAt",
                label: "Email confirmed",
                availableOnCreate: false,
                type: "datetime",
              },
              {
                id: "consentCapturedAt",
                label: "Consent captured",
                availableOnCreate: false,
                type: "datetime",
              },
              { id: "consentSource", label: "Consent source", type: "text" },
              { id: "consentIp", label: "Consent IP", type: "text" },
              { id: "gdprConsentScope", label: "Consent scope", type: "text" },
            ],
            id: "consent",
            title: "Consent & preferences",
          },
          {
            columns: 2,
            description:
              "Shipping details used for fulfillment and customer care.",
            fields: [
              {
                id: "shippingAddressLine1",
                label: "Address line 1",
                type: "text",
              },
              {
                id: "shippingAddressLine2",
                label: "Address line 2",
                type: "text",
              },
              { id: "shippingCity", label: "City", type: "text" },
              { id: "shippingRegion", label: "State / region", type: "text" },
              { id: "shippingPostalCode", label: "Postal code", type: "text" },
              { id: "shippingCountryCode", label: "Country", type: "text" },
              { id: "shippingLatitude", label: "Latitude", type: "text" },
              { id: "shippingLongitude", label: "Longitude", type: "text" },
            ],
            id: "shipping",
            title: "Shipping address",
          },
          {
            columns: 2,
            description:
              "Billing information that syncs with invoices and payment records.",
            fields: [
              {
                id: "billingAddressLine1",
                label: "Address line 1",
                type: "text",
              },
              {
                id: "billingAddressLine2",
                label: "Address line 2",
                type: "text",
              },
              { id: "billingCity", label: "City", type: "text" },
              { id: "billingRegion", label: "State / region", type: "text" },
              { id: "billingPostalCode", label: "Postal code", type: "text" },
              { id: "billingCountryCode", label: "Country", type: "text" },
              { id: "billingLatitude", label: "Latitude", type: "text" },
              { id: "billingLongitude", label: "Longitude", type: "text" },
            ],
            id: "billing",
            title: "Billing address",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description:
              "Track the last touchpoint and upcoming follow-up for this contact.",
            fields: [
              {
                description:
                  "When we last heard from or engaged with this contact.",
                id: "lastActivityAt",
                label: "Last activity",
                type: "datetime",
              },
              {
                description: "The next scheduled task, outreach, or reminder.",
                id: "nextActivityAt",
                label: "Next activity",
                type: "datetime",
              },
              {
                colSpan: 2,
                description:
                  "Internal notes that stay with the team—customers never see these.",
                id: "notes",
                label: "Internal notes",
                type: "textarea",
              },
            ],
            id: "activity",
            title: "Activity",
          },
          {
            description:
              "System metadata used for deduplication and downstream integrations.",
            fields: [{ id: "dedupeKey", label: "Dedupe key", type: "text" }],
            id: "system",
            title: "System metadata",
          },
        ],
      },
      sidebar: "secondColumn",
    },
    supplementalFields: [
      { id: "avatarUrl", label: "Avatar", readOnly: true, type: "text" },
      { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
      { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    ],
  },
  org_leads: {
    header: {
      chips: [
        {
          fieldId: "email",
          icon: "mail",
          id: "lead-email",
          linkType: "mailto",
        },
        { fieldId: "phone", icon: "phone", id: "lead-phone", linkType: "tel" },
      ],
      metadata: [
        {
          fieldId: "createdAt",
          id: "lead-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "lead-updated",
          label: "Updated",
          type: "datetime",
        },
        {
          fieldId: "nextActivityAt",
          id: "lead-next",
          label: "Next activity",
          type: "datetime",
        },
      ],
      subtitle: [{ fieldId: "nationality", prefix: "Region: " }],
      title: {
        fallback: "Unqualified lead",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Primary lead information used by the sales and marketing teams.",
            fields: [
              { id: "lastName", label: "First name", type: "text" },
              { id: "firstName", label: "Last name", type: "text" },
              { id: "salutation", label: "Salutation", type: "text" },
              {
                id: "email",
                label: "Email",
                placeholder: "name@example.com",
                type: "text",
              },
              { id: "phone", label: "Phone", type: "phone" },
              { id: "nationality", label: "Region", type: "text" },
              { id: "score", label: "Lead score", type: "number" },
            ],
            id: "lead-profile",
            title: "Profile",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description:
              "Engagement milestones that determine if the team should follow up.",
            fields: [
              {
                id: "lastActivityAt",
                label: "Last activity",
                availableOnCreate: false,
                type: "datetime",
              },
              {
                id: "nextActivityAt",
                label: "Next activity",
                availableOnCreate: false,
                type: "datetime",
              },
              {
                colSpan: 2,
                description:
                  "Notes, objections, and context gathered during discovery.",
                id: "notes",
                label: "Notes",
                type: "textarea",
              },
            ],
            id: "lead-engagement",
            title: "Engagement",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description:
              "Tags and categories help route and prioritize this lead.",
            fields: [
              {
                description:
                  "Comma or line separated tags for campaigns and routing rules.",
                id: "tags",
                label: "Tags",
                placeholder: "Add tags…",
                tag: {
                  relatedType: "lead",
                },
                type: "tag",
              },
            ],
            id: "lead-segmentation",
            title: "Segmentation",
          },
        ],
      },
    },
    supplementalFields: [
      { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
      { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    ],
  },
  org_accounts: {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "account-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "account-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      subtitle: [
        { fieldId: "industry", prefix: "Industry: " },
        { fieldId: "annualRevenueBand", prefix: "Revenue: " },
      ],
      title: {
        fallback: "Untitled account",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Primary company details used by the sales, marketing, and finance teams.",
            fields: [
              { id: "name", label: "Account name", type: "text" },
              { id: "companyName", label: "Legal name", type: "text" },
              { id: "industry", label: "Industry", type: "text" },
              {
                id: "email",
                label: "Email",
                placeholder: "name@example.com",
                type: "text",
              },
              { id: "phone", label: "Phone", type: "phone" },
              {
                id: "websiteUrl",
                label: "Website",
                placeholder: "https://",
                type: "text",
              },
              { id: "score", label: "Account score", type: "number" },
            ],
            id: "account-overview",
            title: "Account overview",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description:
              "Categorize the account for segmentation, routing, and automation.",
            fields: [
              {
                colSpan: 2,
                description: "Use tags to power workflows and reporting.",
                id: "tags",
                label: "Tags",
                placeholder: "Add tags…",
                tag: {
                  relatedType: "account",
                },
                type: "tag",
              },
              {
                colSpan: 2,
                description: "Long-form context shared with the account team.",
                id: "notes",
                label: "Notes",
                type: "textarea",
              },
            ],
            id: "account-segmentation",
            title: "Segmentation & notes",
          },
          {
            description:
              "Operational details that influence forecasting and resource planning.",
            fields: [
              { id: "annualRevenueBand", label: "Revenue band", type: "text" },
              { id: "employeeCountBand", label: "Employee band", type: "text" },
            ],
            id: "account-business-profile",
            title: "Business profile",
          },
          {
            columns: 2,
            description: "Shipping details used for fulfillment and support.",
            fields: [
              {
                id: "shippingAddressLine1",
                label: "Address line 1",
                type: "text",
              },
              {
                id: "shippingAddressLine2",
                label: "Address line 2",
                type: "text",
              },
              { id: "shippingCity", label: "City", type: "text" },
              { id: "shippingRegion", label: "State / region", type: "text" },
              { id: "shippingPostalCode", label: "Postal code", type: "text" },
              { id: "shippingCountryCode", label: "Country", type: "text" },
              { id: "shippingLatitude", label: "Latitude", type: "text" },
              { id: "shippingLongitude", label: "Longitude", type: "text" },
            ],
            id: "account-shipping",
            title: "Shipping address",
          },
          {
            columns: 2,
            description:
              "Billing information synchronized with invoices and ERP systems.",
            fields: [
              {
                id: "billingAddressLine1",
                label: "Address line 1",
                type: "text",
              },
              {
                id: "billingAddressLine2",
                label: "Address line 2",
                type: "text",
              },
              { id: "billingCity", label: "City", type: "text" },
              { id: "billingRegion", label: "State / region", type: "text" },
              { id: "billingPostalCode", label: "Postal code", type: "text" },
              { id: "billingCountryCode", label: "Country", type: "text" },
              { id: "billingLatitude", label: "Latitude", type: "text" },
              { id: "billingLongitude", label: "Longitude", type: "text" },
            ],
            id: "account-billing",
            title: "Billing address",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description:
              "Timeline entries provide a quick snapshot of engagement status.",
            fields: [
              {
                availableOnCreate: false,
                id: "lastActivityAt",
                label: "Last activity",
                readOnly: true,
                type: "datetime",
              },
              {
                availableOnCreate: false,
                id: "nextActivityAt",
                label: "Next activity",
                readOnly: true,
                type: "datetime",
              },
            ],
            id: "account-timeline",
            title: "Activity timeline",
          },
          {
            description: "Reference profiles across social platforms.",
            fields: [
              { id: "linkedinUrl", label: "LinkedIn", type: "text" },
              { id: "twitterHandle", label: "Twitter", type: "text" },
            ],
            id: "account-social",
            title: "Social links",
          },
        ],
      },
    },
  },
  org_opportunities: {
    header: {
      metadata: [
        {
          fieldId: "expectedCloseDate",
          id: "opportunity-close-date",
          label: "Expected close",
          type: "date",
        },
        {
          fieldId: "status",
          id: "opportunity-status",
          label: "Status",
        },
      ],
      subtitle: [{ fieldId: "accountId", prefix: "Account: " }],
      title: {
        fallback: "Untitled opportunity",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Key fields that determine pipeline forecasts and team priorities.",
            fields: [
              { id: "name", label: "Opportunity name", type: "text" },
              { id: "amount", label: "Amount", type: "number" },
              { id: "currencyCode", label: "Currency", type: "text" },
              { id: "probability", label: "Probability (%)", type: "number" },
              {
                id: "type",
                label: "Opportunity type",
                options: OPPORTUNITY_TYPES,
                type: "picklist",
              },
              {
                id: "status",
                label: "Status",
                options: OPPORTUNITY_STATUS,
                type: "picklist",
              },
              {
                id: "priority",
                label: "Priority",
                options: OPPORTUNITY_PRIORITY,
                type: "picklist",
              },
              {
                id: "forecastCategory",
                label: "Forecast category",
                options: FORECAST_CATEGORIES,
                type: "picklist",
              },
              {
                id: "expectedCloseDate",
                label: "Expected close",
                type: "date",
              },
            ],
            id: "opportunity-overview",
            title: "Pipeline summary",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description:
              "Notes and next steps keep the deal progressing through the pipeline.",
            fields: [
              {
                id: "nextStep",
                label: "Next step",
                placeholder: "Outline the next activity",
                type: "text",
              },
              {
                id: "description",
                label: "Description",
                type: "textarea",
              },
            ],
            id: "opportunity-notes",
            title: "Notes",
          },
          {
            description:
              "Engagement milestones recorded automatically from activities.",
            fields: [
              {
                availableOnCreate: false,
                id: "lastActivityAt",
                label: "Last activity",
                readOnly: true,
                type: "datetime",
              },
              {
                availableOnCreate: false,
                id: "nextActivityAt",
                label: "Next activity",
                readOnly: true,
                type: "datetime",
              },
            ],
            id: "opportunity-activity",
            title: "Activity",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description:
              "Primary associations that link this opportunity to other records.",
            fields: [
              {
                id: "primaryContactId",
                label: "Primary contact ID",
                type: "text",
              },
            ],
            id: "opportunity-relationships",
            title: "Relationships",
          },
          {
            description:
              "Marketing attribution parameters captured from acquisition channels.",
            fields: [
              { id: "source", label: "Source", type: "text" },
              { id: "sourceDetail", label: "Source detail", type: "text" },
              { id: "utmSource", label: "UTM source", type: "text" },
              { id: "utmMedium", label: "UTM medium", type: "text" },
              { id: "utmCampaign", label: "UTM campaign", type: "text" },
              { id: "utmTerm", label: "UTM term", type: "text" },
              { id: "utmContent", label: "UTM content", type: "text" },
            ],
            id: "opportunity-marketing",
            title: "Attribution",
          },
          {
            description:
              "Use tags to group opportunities for reporting and automation.",
            fields: [
              {
                id: "tags",
                label: "Tags",
                placeholder: "Add tags…",
                tag: {
                  relatedType: "opportunity",
                },
                type: "tag",
              },
            ],
            id: "opportunity-tags",
            title: "Tags",
          },
        ],
      },
    },
  },
  org_activities: {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "activity-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "activity-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      title: {
        fallback: "Untitled activity",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Core activity attributes captured in your CRM.",
            fields: [
              { id: "name", label: "Name", type: "text" },
              { id: "ownerId", label: "Owner ID", type: "text" },
              { id: "createdBy", label: "Created by", type: "text" },
              { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
            ],
            id: "activity-details",
            title: "Activity details",
          },
        ],
      },
      firstColumn: { sections: [] },
      secondColumn: { sections: [] },
    },
  },
  org_categories: baseDefaultLayout,
  org_tags: baseDefaultLayout,
  org_events: baseDefaultLayout,
  org_tasks: baseDefaultLayout,
  org_email_templates: baseDefaultLayout,
  org_email_campaigns: baseDefaultLayout,
  org_email_domains: baseDefaultLayout,
  org_real_estate_projects: baseDefaultLayout,
  org_real_estate_properties: baseDefaultLayout,
  org_real_estate_bookings: baseDefaultLayout,
  org_payment_plans: baseDefaultLayout,
  org_payment_plan_templates: baseDefaultLayout,
  org_email_test_receivers: baseDefaultLayout,
  org_emails: baseDefaultLayout,
  org_email_clicks: baseDefaultLayout,
  org_real_estate_booking_buyers: baseDefaultLayout,
} as const;

/**
 * Entity type that has a default layout
 */
export type DefaultLayoutEntityType = keyof typeof DEFAULT_RECORD_LAYOUTS;
