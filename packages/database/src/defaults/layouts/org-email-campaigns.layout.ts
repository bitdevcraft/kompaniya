/**
 * Default record layout for org_email_campaigns
 */

import { env } from "@/env";

import {
  AUDIENCE_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
  TAG_MATCH_OPTIONS,
} from "./constants";

export const orgEmailCampaignsLayout = {
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
              options: CAMPAIGN_STATUS_OPTIONS,
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
              label: "Sending domain",
              placeholder: "Domain identifier",
              type: "reference",
              reference: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/r/:id`,
              },
            },
            {
              id: "orgEmailTemplateId",
              label: "Template",
              placeholder: "Template identifier",
              type: "reference",
              reference: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-template/r/:id`,
              },
            },
            {
              id: "orgEmailTestReceiverId",
              label: "Test receiver",
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
              description: "Choose whether all or any of the tags must match.",
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
      firstColumn: { sections: [] },
      secondColumn: { sections: [] },
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
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    { id: "deletedAt", label: "Deleted", readOnly: true, type: "datetime" },
  ],
};
