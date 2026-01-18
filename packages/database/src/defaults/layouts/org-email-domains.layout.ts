/**
 * Default record layout for org_email_domains
 */

import { EMAIL_DOMAIN_STATUS } from "./constants";

export const orgEmailDomainsLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled domain" },
    metadata: [
      {
        fieldId: "status",
        id: "domain-status",
        label: "Status",
      },
      {
        fieldId: "verified",
        id: "domain-verified",
        label: "Verified",
      },
      {
        fieldId: "createdAt",
        id: "domain-created",
        label: "Added",
        type: "datetime",
      },
    ],
    subtitle: [{ fieldId: "email", prefix: "Contact: " }],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Email domains are used to send campaigns and transactional emails from your organization.",
          fields: [
            { id: "name", label: "Domain name", type: "text" },
            {
              id: "email",
              label: "Contact email",
              type: "text",
              description:
                "Email address for domain verification and communications",
            },
            {
              id: "verified",
              label: "Verified",
              type: "boolean",
            },
            {
              id: "status",
              label: "Status",
              type: "picklist",
              options: EMAIL_DOMAIN_STATUS,
            },
          ],
          id: "domain-details",
          title: "Domain details",
        },
        {
          description:
            "Domain verification keys (auto-configured, do not modify)",
          columns: 1,
          fields: [
            {
              id: "public",
              label: "Public key",
              type: "text",
              readOnly: true,
              description: "Add this to your DNS as a TXT record",
            },
            {
              id: "secret",
              label: "Secret key",
              type: "text",
              readOnly: true,
            },
          ],
          id: "domain-verification",
          title: "Verification keys",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description:
            "Track the warm-up progress for newly configured domains to establish sender reputation.",
          fields: [
            {
              id: "firstEmailSentAt",
              label: "First email sent",
              type: "datetime",
              readOnly: true,
            },
            {
              id: "warmupCompletedAt",
              label: "Warm-up completed",
              type: "datetime",
              readOnly: true,
            },
            {
              id: "dailyLimit",
              label: "Daily sending limit",
              type: "number",
              description: "Maximum emails per day during warm-up period",
            },
          ],
          id: "domain-warmup",
          title: "Warm-up status",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Owner and tracking information.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "domain-tracking",
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
