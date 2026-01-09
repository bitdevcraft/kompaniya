import { type RecordPageLayout } from "@/components/record-page/layout";

export const paymentPlanTemplateRecordLayout: RecordPageLayout = {
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
    title: {
      fallback: "Untitled template",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Template identification and description.",
          fields: [
            { id: "name", label: "Template name", type: "text" },
            { id: "description", label: "Description", type: "textarea" },
          ],
          id: "template-details",
          title: "Template details",
        },
        {
          description: "Configure payment schedule and amounts.",
          fields: [
            {
              id: "numberOfInstallments",
              label: "Number of installments",
              type: "number",
            },
            { id: "interval", label: "Payment interval", type: "text" },
            {
              id: "defaultAmount",
              label: "Default amount",
              type: "number",
            },
          ],
          id: "template-configuration",
          title: "Plan configuration",
        },
      ],
    },
  },
};
