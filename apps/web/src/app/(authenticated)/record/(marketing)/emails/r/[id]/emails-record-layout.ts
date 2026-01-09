import { FieldOption as RecordFieldOption } from "@repo/domain";

import { type RecordPageLayout } from "@/components/record-page/layout";
import { env } from "@/env/client";

const STATUS_OPTIONS: RecordFieldOption[] = [
  { label: "Sent", value: "SENT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Bounced", value: "BOUNCED" },
  { label: "Opened", value: "OPENED" },
  { label: "Complaint", value: "COMPLAINT" },
];

export const emailsRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "status",
        id: "email-status",
        label: "Status",
      },
      {
        fieldId: "createdAt",
        id: "email-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "email-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    subtitle: [{ fieldId: "subject", prefix: "Subject: " }],
    title: {
      fallback: "Untitled email",
      fieldId: "messageId",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Email content and delivery status.",
          fields: [
            {
              availableOnCreate: false,
              id: "messageId",
              label: "Message ID",
              readOnly: true,
              type: "text",
            },
            { id: "subject", label: "Subject", type: "text" },
            {
              id: "status",
              label: "Status",
              options: STATUS_OPTIONS,
              type: "picklist",
            },
          ],
          id: "email-details",
          title: "Email details",
        },
        {
          description: "Associated campaign, domain, and contact.",
          fields: [
            {
              id: "emailCampaignId",
              label: "Campaign ID",
              placeholder: "Campaign identifier",
              type: "lookup",
              lookup: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-campaign/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-campaign/r/:id`,
              },
            },
            {
              id: "emailDomainId",
              label: "Domain ID",
              placeholder: "Domain identifier",
              type: "lookup",
              lookup: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/domain/r/:id`,
              },
            },
            {
              id: "crmContactId",
              label: "Contact ID",
              placeholder: "Contact identifier",
              type: "lookup",
              lookup: {
                searchEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/contact/paginated`,
                findByIdEndpoint: `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/contact/r/:id`,
              },
            },
          ],
          id: "email-associations",
          title: "Associations",
        },
      ],
    },
  },
  supplementalFields: [
    {
      availableOnCreate: false,
      id: "body",
      label: "Email body",
      readOnly: true,
      type: "html",
    },
    {
      availableOnCreate: false,
      id: "rawMessage",
      label: "Raw message",
      readOnly: true,
      type: "text",
    },
  ],
};
