/**
 * Default record layout for org_opportunities
 */

import { env } from "@/env";

import {
  FORECAST_CATEGORIES,
  OPPORTUNITY_PRIORITY,
  OPPORTUNITY_STATUS,
  OPPORTUNITY_TYPES,
} from "./constants";

export const orgOpportunitiesLayout = {
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
      {
        fieldId: "amount",
        id: "opportunity-amount",
        label: "Amount",
      },
    ],
    subtitle: [
      { fieldId: "accountId", prefix: "Account: " },
      { fieldId: "probability", prefix: "Probability: " },
    ],
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
            {
              availableOnCreate: false,
              id: "closedWonAt",
              label: "Closed won",
              readOnly: true,
              type: "datetime",
            },
            {
              availableOnCreate: false,
              id: "closedLostAt",
              label: "Closed lost",
              readOnly: true,
              type: "datetime",
            },
          ],
          id: "opportunity-activity",
          title: "Activity",
        },
        {
          description: "Loss analysis if the opportunity was closed as lost.",
          fields: [
            {
              id: "lostReasonId",
              label: "Lost reason ID",
              type: "text",
            },
            {
              id: "lostReasonNote",
              label: "Lost reason note",
              type: "textarea",
            },
          ],
          id: "opportunity-loss",
          title: "Loss tracking",
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
              label: "Account",
              type: "reference",
              reference: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/account/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/account/r/:id`,
                redirectBaseUrl: `/record/accounts/r/:id`,
              },
            },
            {
              id: "primaryContactId",
              label: "Primary contact",
              type: "reference",
              reference: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/contact/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/contact/r/:id`,
                redirectBaseUrl: `/record/contacts/r/:id`,
              },
            },
            {
              id: "ownerUserId",
              label: "Owner",
              type: "text",
            },
            {
              id: "teamId",
              label: "Team",
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
            {
              id: "isArchived",
              label: "Archived",
              type: "boolean",
            },
          ],
          id: "opportunity-tags",
          title: "Tags & status",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    { id: "deletedAt", label: "Deleted", readOnly: true, type: "datetime" },
    {
      id: "exchangeRate",
      label: "Exchange rate",
      readOnly: true,
      type: "number",
    },
    {
      id: "amountHome",
      label: "Amount (home currency)",
      readOnly: true,
      type: "number",
    },
  ],
};
