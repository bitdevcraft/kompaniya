/**
 * Default record layouts for each entity type
 *
 * These layouts are used as defaults when seeding new organizations.
 * The structure matches the RecordPageLayout interface from the web app.
 *
 * Note: These are simplified defaults. The web app has more detailed layouts
 * that can be synced to the database in the future.
 */

import { env } from "@/env";

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

const STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Sending", value: "SENDING" },
  { label: "Paused", value: "PAUSED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Failed", value: "FAILED" },
];

const TAG_MATCH_OPTIONS = [
  { label: "Match all tags", value: "ALL" },
  { label: "Match any tag", value: "ANY" },
];

const AUDIENCE_OPTIONS = [
  { label: "Newsletter", value: "newsletter" },
  { label: "Product updates", value: "product-updates" },
  { label: "VIP", value: "vip" },
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
                id: "accountId",
                label: "Account ID",
                type: "reference",
                reference: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/account/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/account/r/:id`,
                  redirectBaseUrl: `/record/accounts/r/:id`,
                },
              },
              {
                id: "primaryContactId",
                label: "Primary contact ID",
                type: "reference",
                reference: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/contact/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/contact/r/:id`,
                  redirectBaseUrl: `/record/contacts/r/:id`,
                },
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
  org_email_campaigns: {
    header: {
      metadata: [
        {
          fieldId: "status",
          id: "campaign-status",
          label: "Status",
        },
        {
          fieldId: "scheduledFor",
          id: "campaign-scheduled",
          label: "Scheduled for",
          type: "datetime",
        },
        {
          fieldId: "startedAt",
          id: "campaign-started",
          label: "Started",
          type: "datetime",
        },
      ],
      subtitle: [{ fieldId: "subject", prefix: "Subject: " }],
      title: {
        fallback: "Untitled campaign",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Set the foundation for the campaign before tailoring the audience and content.",
            fields: [
              {
                id: "name",
                label: "Campaign name",
                placeholder: "Spring launch",
                type: "text",
              },
              { id: "subject", label: "Email subject", type: "text" },
              {
                availableOnCreate: false,
                id: "status",
                label: "Status",
                options: STATUS_OPTIONS,
                readOnly: true,
                type: "picklist",
              },
            ],
            id: "campaign-basics",
            title: "Campaign details",
          },
          {
            description:
              "Connect the campaign to approved domains, templates, and test recipients before sending.",
            fields: [
              {
                id: "orgEmailDomainId",
                label: "Sending domain ID",
                placeholder: "Domain identifier",
                type: "reference",
                reference: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/r/:id`,
                },
              },
              {
                id: "orgEmailTemplateId",
                label: "Template ID",
                placeholder: "Template identifier",
                type: "reference",
                reference: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template/r/:id`,
                },
              },
              {
                id: "orgEmailTestReceiverId",
                label: "Test receiver ID",
                placeholder: "Receiver identifier",
                type: "reference",
                reference: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-test-receiver/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-test-receiver/r/:id`,
                },
              },
            ],
            id: "campaign-associations",
            title: "Infrastructure",
          },
          {
            description:
              "Select the audiences this campaign will target for personalization and segmentation.",
            fields: [
              {
                description:
                  "Use contact tags to build targeted segments for this campaign.",
                id: "targetTags",
                label: "Target tags",
                placeholder: "Add tags.",
                tag: {
                  relatedType: "contact",
                },
                type: "tag",
              },
              {
                description:
                  "Choose whether all or any of the tags must match.",
                id: "tagMatchType",
                label: "Tag match rule",
                options: TAG_MATCH_OPTIONS,
                type: "picklist",
              },
              {
                description:
                  "Use comma separated values to add multiple categories.",
                id: "targetCategories",
                label: "Target categories",
                options: AUDIENCE_OPTIONS,
                placeholder: "Add categories.",
                type: "multipicklist",
              },
            ],
            id: "campaign-audience",
            title: "Audience",
          },
          {
            description: "Timing and lifecycle checkpoints for this campaign.",
            fields: [
              {
                availableOnCreate: false,
                id: "scheduledFor",
                label: "Scheduled for",
                readOnly: true,
                type: "datetime",
              },
              {
                availableOnCreate: false,
                id: "startedAt",
                label: "Started at",
                readOnly: true,
                type: "datetime",
              },
              {
                availableOnCreate: false,
                id: "completedAt",
                label: "Completed at",
                readOnly: true,
                type: "datetime",
              },
              {
                availableOnCreate: false,
                id: "cancelledAt",
                label: "Cancelled at",
                readOnly: true,
                type: "datetime",
              },
            ],
            id: "campaign-scheduling",
            title: "Scheduling",
          },
          {
            columns: 3,
            description: "Real-time performance metrics for the current send.",
            fields: [
              {
                availableOnCreate: false,
                id: "totalRecipients",
                label: "Total recipients",
                readOnly: true,
                type: "number",
              },
              {
                availableOnCreate: false,
                id: "sentCount",
                label: "Sent",
                readOnly: true,
                type: "number",
              },
              {
                availableOnCreate: false,
                id: "deliveredCount",
                label: "Delivered",
                readOnly: true,
                type: "number",
              },
              {
                availableOnCreate: false,
                id: "openedCount",
                label: "Opened",
                readOnly: true,
                type: "number",
              },
              {
                availableOnCreate: false,
                id: "clickedCount",
                label: "Clicked",
                readOnly: true,
                type: "number",
              },
              {
                availableOnCreate: false,
                id: "bouncedCount",
                label: "Bounced",
                readOnly: true,
                type: "number",
              },
              {
                availableOnCreate: false,
                id: "complainedCount",
                label: "Complained",
                readOnly: true,
                type: "number",
              },
            ],
            id: "campaign-performance",
            title: "Performance",
          },
          {
            description:
              "Compose the HTML content for the campaign and preview the final output.",
            fields: [
              {
                description:
                  "Use the visual editor to craft the email content and preview the HTML output.",
                id: "mjmlJsonContent",
                label: "Email body",
                type: "mjml",
              },
            ],
            id: "campaign-content",
            title: "Content",
            columns: 1,
          },
        ],
      },
    },
    supplementalFields: [
      {
        id: "htmlContent",
        label: "HTML content",
        type: "html",
      },
      {
        id: "mjmlContent",
        label: "MJML content",
        type: "text",
      },
      {
        id: "body",
        label: "Email body",
        type: "html",
      },
    ],
  },
  org_email_domains: baseDefaultLayout,
  org_real_estate_projects: baseDefaultLayout,
  org_real_estate_properties: baseDefaultLayout,
  org_real_estate_bookings: baseDefaultLayout,
  org_payment_plans: {
    header: {
      title: { fieldId: "name", fallback: "Untitled plan" },
      metadata: [
        { fieldId: "status", id: "plan-status", label: "Status" },
        { fieldId: "currency", id: "plan-currency", label: "Currency" },
        {
          fieldId: "startDate",
          id: "plan-start",
          label: "Start date",
          type: "date",
        },
        { fieldId: "endDate", id: "plan-end", label: "End date", type: "date" },
      ],
    },
    sectionColumns: {
      header: {
        sections: [
          {
            id: "plan-overview",
            title: "Plan Overview",
            fields: [
              { id: "name", label: "Plan name", type: "text" },
              {
                id: "templateId",
                label: "Template",
                type: "text",
                readOnly: true,
              },
              {
                id: "principalAmount",
                label: "Principal amount",
                type: "number",
                readOnly: true,
              },
              {
                id: "currency",
                label: "Currency",
                type: "text",
                readOnly: true,
              },
              { id: "status", label: "Status", type: "text", readOnly: true },
            ],
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            id: "schedule",
            title: "Payment Schedule",
            description: "All scheduled payments for this plan",
            fields: [
              {
                id: "instanceConfig.scheduleItems",
                label: "Schedule",
                type: "payment_schedule",
                readOnly: true,
              },
            ],
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            id: "events",
            title: "Key Events",
            fields: [
              {
                id: "instanceConfig.events.bookingDate",
                label: "Booking date",
                type: "date",
                readOnly: true,
              },
              {
                id: "instanceConfig.events.contractSigningDate",
                label: "Contract signing",
                type: "date",
                readOnly: true,
              },
              {
                id: "instanceConfig.events.handoverDate",
                label: "Handover date",
                type: "date",
                readOnly: true,
              },
            ],
          },
        ],
      },
    },
  },
  org_payment_plan_templates: {
    header: {
      title: { fieldId: "name", fallback: "Untitled template" },
      metadata: [
        { fieldId: "code", id: "template-code", label: "Code" },
        { fieldId: "isActive", id: "template-active", label: "Active" },
        {
          fieldId: "createdAt",
          id: "template-created",
          label: "Created",
          type: "datetime",
        },
      ],
    },
    sectionColumns: {
      header: {
        sections: [
          {
            id: "template-info",
            title: "Template Information",
            fields: [
              { id: "name", label: "Template name", type: "text" },
              { id: "code", label: "Code", type: "text" },
              { id: "description", label: "Description", type: "textarea" },
              {
                id: "defaultCurrency",
                label: "Default currency",
                type: "text",
              },
              { id: "subjectType", label: "Subject type", type: "text" },
              {
                id: "minPrincipal",
                label: "Minimum principal",
                type: "number",
              },
              {
                id: "maxPrincipal",
                label: "Maximum principal",
                type: "number",
              },
              { id: "isActive", label: "Is active", type: "boolean" },
            ],
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            id: "milestones",
            title: "Payment Milestones",
            description: "Configure when payments are due",
            fields: [
              {
                id: "templateConfig.milestones",
                label: "Milestone Configuration",
                type: "payment_plan_milestones",
                readOnly: true,
              },
            ],
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            id: "fee-rules",
            title: "Fee Rules",
            description: "Configure additional fees and charges",
            fields: [
              {
                id: "templateConfig.feeRules",
                label: "Fee Configuration",
                type: "payment_plan_fees",
                readOnly: true,
              },
            ],
          },
        ],
      },
    },
  },
  org_email_test_receivers: baseDefaultLayout,
  org_emails: baseDefaultLayout,
  org_email_clicks: baseDefaultLayout,
  org_real_estate_booking_buyers: baseDefaultLayout,
} as const;

/**
 * Entity type that has a default layout
 */
export type DefaultLayoutEntityType = keyof typeof DEFAULT_RECORD_LAYOUTS;
