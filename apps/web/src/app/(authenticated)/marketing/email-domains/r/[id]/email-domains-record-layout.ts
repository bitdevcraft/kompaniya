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
      ],
    },
  },
};
