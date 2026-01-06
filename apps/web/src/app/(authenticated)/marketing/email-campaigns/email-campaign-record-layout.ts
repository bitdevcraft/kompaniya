import {
  type RecordFieldOption,
  type RecordPageLayout,
} from "@/components/record-page/layout";
import { env } from "@/env/client";

import type { EmailCampaignRecordFormValues } from "./email-campaign-record-schema";

const STATUS_OPTIONS: RecordFieldOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Sending", value: "sending" },
  { label: "Completed", value: "completed" },
];

const AUDIENCE_OPTIONS: RecordFieldOption[] = [
  { label: "Newsletter", value: "newsletter" },
  { label: "Product updates", value: "product-updates" },
  { label: "VIP", value: "vip" },
];

export const emailCampaignRecordLayout: RecordPageLayout<EmailCampaignRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "status",
          id: "campaign-status",
          label: "Status",
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
                id: "status",
                label: "Status",
                options: STATUS_OPTIONS,
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
                type: "lookup",
                lookup: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/r/:id`,
                },
              },
              {
                id: "orgEmailTemplateId",
                label: "Template ID",
                placeholder: "Template identifier",
                type: "lookup",
                lookup: {
                  searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template/paginated`,
                  findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template/r/:id`,
                },
              },
              {
                id: "orgEmailTestReceiverId",
                label: "Test receiver ID",
                placeholder: "Receiver identifier",
                type: "lookup",
                lookup: {
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
  };
