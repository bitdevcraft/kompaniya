import { type RecordPageLayout } from "@/components/record-page/layout";

import type { EmailTemplateRecordFormValues } from "./email-template-record-schema";

export const emailTemplateRecordLayout: RecordPageLayout<EmailTemplateRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "template-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "template-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      subtitle: [{ fieldId: "subject", prefix: "Subject: " }],
      title: {
        fallback: "Untitled template",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description:
              "Name and subject line used when selecting this template.",
            fields: [
              {
                id: "name",
                label: "Template name",
                placeholder: "Welcome series",
                type: "text",
              },
              {
                id: "subject",
                label: "Email subject",
                placeholder: "Welcome to our newsletter",
                type: "text",
              },
            ],
            id: "template-details",
            title: "Template details",
          },
          {
            columns: 1,
            description:
              "Use the visual editor to refine the template content.",
            fields: [
              {
                description:
                  "Update the layout and content with the MJML editor.",
                id: "mjmlJsonContent",
                label: "Email body",
                type: "mjml",
              },
            ],
            id: "template-content",
            title: "Content",
          },
        ],
      },
    },
    supplementalFields: [
      { id: "htmlContent", label: "HTML content", type: "html" },
      { id: "mjmlContent", label: "MJML content", type: "text" },
      { id: "body", label: "Email body", type: "html" },
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
