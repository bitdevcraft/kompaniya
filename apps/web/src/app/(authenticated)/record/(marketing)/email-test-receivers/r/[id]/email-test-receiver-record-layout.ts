import { RecordPageLayout } from "@/components/record-page/layout";

import type { EmailTestReceiverRecordFormValues } from "../../email-test-receiver-record-schema";

export const emailTestReceiverRecordLayout: RecordPageLayout<EmailTestReceiverRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "receiver-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "receiver-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      title: {
        fallback: "Untitled test receiver",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Maintain the list of emails that should receive test sends.",
            fields: [
              {
                id: "name",
                label: "List name",
                placeholder: "Internal QA list",
                type: "text",
              },
              {
                colSpan: 2,
                description: "Enter one email per line.",
                id: "emails",
                label: "Email recipients",
                placeholder: "name@example.com",
                type: "textarea",
              },
            ],
            id: "receiver-details",
            title: "Test receiver details",
          },
        ],
      },
    },
    supplementalFields: [
      {
        id: "createdAt",
        label: "Created",
        readOnly: true,
        type: "datetime",
      },
      {
        id: "updatedAt",
        label: "Updated",
        readOnly: true,
        type: "datetime",
      },
    ],
  };
