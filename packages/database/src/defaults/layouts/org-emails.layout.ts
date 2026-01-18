/**
 * Default record layout for org_emails
 */

import { EMAIL_STATUS } from "./constants";

export const orgEmailsLayout = {
  header: {
    title: { fieldId: "subject", fallback: "No subject" },
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
        fieldId: "emailCampaignId",
        id: "email-campaign",
        label: "Campaign",
      },
    ],
    subtitle: [{ fieldId: "messageId", prefix: "ID: " }],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Email records track individual email sends and their delivery status.",
          fields: [
            {
              id: "subject",
              label: "Subject",
              type: "text",
            },
            {
              id: "status",
              label: "Status",
              type: "picklist",
              options: EMAIL_STATUS,
            },
            {
              id: "messageId",
              label: "Message ID",
              type: "text",
              readOnly: true,
            },
          ],
          id: "email-details",
          title: "Email details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Email content and body.",
          fields: [
            {
              id: "body",
              label: "Email body",
              type: "textarea",
            },
            {
              id: "rawMessage",
              label: "Raw message",
              type: "textarea",
            },
          ],
          id: "email-content",
          title: "Content",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Related records that this email is associated with.",
          fields: [
            {
              id: "emailCampaignId",
              label: "Campaign ID",
              type: "text",
            },
            {
              id: "emailDomainId",
              label: "Domain ID",
              type: "text",
            },
            {
              id: "crmContactId",
              label: "Contact ID",
              type: "text",
            },
          ],
          id: "email-relations",
          title: "Related records",
        },
        {
          description: "Owner and tracking information.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "email-tracking",
          title: "Tracking",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    { id: "deletedAt", label: "Deleted", readOnly: true, type: "datetime" },
  ],
};
