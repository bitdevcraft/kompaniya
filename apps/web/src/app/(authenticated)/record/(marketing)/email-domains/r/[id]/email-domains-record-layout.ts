import { type RecordPageLayout } from "@/components/record-page/layout";

export const emailDomainsRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "domain-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "domain-updated",
        label: "Updated",
        type: "datetime",
      },
      {
        fieldId: "status",
        id: "domain-status",
        label: "Status",
      },
    ],
    title: {
      fallback: "Untitled domain",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Domain configuration for email sending.",
          fields: [{ id: "name", label: "Domain", type: "text" }],
          id: "domain-details",
          title: "Domain details",
        },
        {
          description:
            "Verification status for email authentication protocols.",
          fields: [
            {
              availableOnCreate: false,
              id: "verified",
              label: "Verified",
              readOnly: true,
              type: "boolean",
            },
            {
              availableOnCreate: false,
              id: "status",
              label: "Status",
              readOnly: true,
              type: "text",
            },
            {
              availableOnCreate: false,
              id: "dkimStatus",
              label: "DKIM status",
              readOnly: true,
              type: "text",
            },
            {
              availableOnCreate: false,
              id: "spfStatus",
              label: "SPF status",
              readOnly: true,
              type: "text",
            },
          ],
          id: "domain-verification",
          title: "Verification status",
        },
        {
          description:
            "Track warm-up progress and daily limits for the sending domain.",
          fields: [
            {
              availableOnCreate: false,
              id: "firstEmailSentAt",
              label: "Warm-up started",
              readOnly: true,
              type: "datetime",
            },
            {
              availableOnCreate: false,
              id: "warmupCompletedAt",
              label: "Warm-up completed",
              readOnly: true,
              type: "datetime",
            },
            {
              availableOnCreate: false,
              id: "dailyLimit",
              label: "Daily limit",
              readOnly: true,
              type: "number",
            },
          ],
          id: "domain-warmup",
          title: "Warm-up",
        },
      ],
    },
  },
};
