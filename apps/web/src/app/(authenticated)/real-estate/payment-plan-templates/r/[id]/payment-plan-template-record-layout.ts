import { type RecordPageLayout } from "@/components/record-page/layout";

import type { PaymentPlanTemplateRecordFormValues } from "./payment-plan-template-record-schema";

export const paymentPlanTemplateRecordLayout: RecordPageLayout<PaymentPlanTemplateRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "payment-plan-template-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "payment-plan-template-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      title: {
        fallback: "Untitled payment plan template",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Template defaults that drive generated plans.",
            fields: [
              { id: "name", label: "Name", type: "text" },
              { id: "code", label: "Code", type: "text" },
              {
                id: "defaultCurrency",
                label: "Default currency",
                type: "text",
              },
              { id: "subjectType", label: "Subject type", type: "text" },
              { id: "minPrincipal", label: "Min principal", type: "text" },
              { id: "maxPrincipal", label: "Max principal", type: "text" },
              { id: "version", label: "Version", type: "number" },
              { id: "isActive", label: "Active", type: "checkbox" },
              { id: "description", label: "Description", type: "textarea" },
            ],
            id: "payment-plan-template-details",
            title: "Template details",
          },
        ],
      },
      firstColumn: { sections: [] },
      secondColumn: { sections: [] },
    },
  };
