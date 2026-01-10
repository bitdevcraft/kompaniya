import { type RecordPageLayout } from "@/components/record-page/layout";
import { env } from "@/env/client";

import type { OpportunityRecordFormValues } from "./opportunity-record-schema";

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

export const opportunityRecordLayout: RecordPageLayout<OpportunityRecordFormValues> =
  {
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
                  redirectBaseUrl: `/crm/accounts/r/:id`,
                },
              },
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
  };
