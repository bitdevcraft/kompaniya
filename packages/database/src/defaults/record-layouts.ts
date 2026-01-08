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
        { fieldId: "phone", icon: "phone", id: "phone-chip", linkType: "tel" },
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
        { fieldId: "companyName" },
        { fieldId: "languagePref", prefix: "Language: " },
      ],
      title: { fieldId: "name", fallback: "Unnamed contact" },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Key identifiers for the CRM.",
            fields: [
              { id: "lastName", label: "First name", type: "text" },
              { id: "firstName", label: "Last name", type: "text" },
              { id: "companyName", label: "Company", type: "text" },
              { id: "email", label: "Email", type: "text" },
              { id: "phone", label: "Phone", type: "phone" },
              { id: "websiteUrl", label: "Website", type: "text" },
            ],
            id: "profile",
            title: "Profile",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description: "Classify the contact for segmentation.",
            fields: [
              {
                colSpan: 2,
                id: "tags",
                label: "Tags",
                tag: { relatedType: "contact" },
                type: "tag",
              },
              { id: "industry", label: "Industry", type: "text" },
            ],
            id: "segmentation",
            title: "Segmentation",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description: "Activity tracking.",
            fields: [
              {
                id: "lastActivityAt",
                label: "Last activity",
                type: "datetime",
              },
              { id: "notes", label: "Internal notes", type: "textarea" },
            ],
            id: "activity",
            title: "Activity",
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
          id: "email-chip",
          linkType: "mailto",
        },
        { fieldId: "phone", icon: "phone", id: "phone-chip", linkType: "tel" },
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
      ],
      subtitle: [{ fieldId: "nationality", prefix: "Region: " }],
      title: { fieldId: "name", fallback: "Unqualified lead" },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Primary lead information.",
            fields: [
              { id: "lastName", label: "First name", type: "text" },
              { id: "firstName", label: "Last name", type: "text" },
              { id: "email", label: "Email", type: "text" },
              { id: "phone", label: "Phone", type: "phone" },
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
            description: "Engagement tracking.",
            fields: [
              {
                id: "lastActivityAt",
                label: "Last activity",
                type: "datetime",
              },
              { id: "notes", label: "Notes", type: "textarea" },
            ],
            id: "engagement",
            title: "Engagement",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description: "Segmentation for routing.",
            fields: [
              {
                id: "tags",
                label: "Tags",
                tag: { relatedType: "lead" },
                type: "tag",
              },
            ],
            id: "segmentation",
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
      subtitle: [
        { fieldId: "industry", prefix: "Industry: " },
        { fieldId: "annualRevenueBand", prefix: "Revenue: " },
      ],
      title: { fieldId: "name", fallback: "Untitled account" },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Primary company details.",
            fields: [
              { id: "name", label: "Account name", type: "text" },
              { id: "industry", label: "Industry", type: "text" },
              { id: "email", label: "Email", type: "text" },
              { id: "phone", label: "Phone", type: "phone" },
              { id: "websiteUrl", label: "Website", type: "text" },
            ],
            id: "overview",
            title: "Account overview",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description: "Categorize the account.",
            fields: [
              {
                id: "tags",
                label: "Tags",
                tag: { relatedType: "account" },
                type: "tag",
              },
              { id: "notes", label: "Notes", type: "textarea" },
            ],
            id: "segmentation",
            title: "Segmentation",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description: "Activity snapshot.",
            fields: [
              {
                id: "lastActivityAt",
                label: "Last activity",
                type: "datetime",
              },
            ],
            id: "timeline",
            title: "Activity",
          },
        ],
      },
      sidebar: "secondColumn",
    },
    supplementalFields: [
      { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
      { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    ],
  },
  org_opportunities: {
    header: {
      metadata: [
        {
          fieldId: "expectedCloseDate",
          id: "close-date",
          label: "Expected close",
          type: "date",
        },
        { fieldId: "status", id: "status", label: "Status" },
      ],
      subtitle: [{ fieldId: "accountId", prefix: "Account: " }],
      title: { fieldId: "name", fallback: "Untitled opportunity" },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Pipeline fields.",
            fields: [
              { id: "name", label: "Opportunity name", type: "text" },
              { id: "amount", label: "Amount", type: "number" },
              { id: "probability", label: "Probability (%)", type: "number" },
              {
                id: "expectedCloseDate",
                label: "Expected close",
                type: "date",
              },
            ],
            id: "overview",
            title: "Pipeline summary",
          },
        ],
      },
      firstColumn: {
        sections: [
          {
            description: "Deal notes.",
            fields: [
              { id: "nextStep", label: "Next step", type: "text" },
              { id: "description", label: "Description", type: "textarea" },
            ],
            id: "notes",
            title: "Notes",
          },
        ],
      },
      secondColumn: {
        sections: [
          {
            description: "Deal associations.",
            fields: [{ id: "accountId", label: "Account ID", type: "text" }],
            id: "relationships",
            title: "Relationships",
          },
          {
            description: "Group opportunities.",
            fields: [
              {
                id: "tags",
                label: "Tags",
                tag: { relatedType: "opportunity" },
                type: "tag",
              },
            ],
            id: "tags",
            title: "Tags",
          },
        ],
      },
      sidebar: "secondColumn",
    },
    supplementalFields: [
      { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
      { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    ],
  },
  org_activities: baseDefaultLayout,
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
