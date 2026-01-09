import { type RecordPageLayout } from "@/components/record-page/layout";

import type { PaymentPlanRecordFormValues } from "./payment-plan-record-schema";

export const paymentPlanRecordLayout: RecordPageLayout<PaymentPlanRecordFormValues> =
  {
    header: {
      metadata: [
        {
          fieldId: "createdAt",
          id: "payment-plan-created",
          label: "Created",
          type: "datetime",
        },
        {
          fieldId: "updatedAt",
          id: "payment-plan-updated",
          label: "Updated",
          type: "datetime",
        },
      ],
      title: {
        fallback: "Untitled payment plan",
        fieldId: "name",
      },
    },
    sectionColumns: {
      header: {
        sections: [
          {
            description: "Payment plan summary and scheduling details.",
            fields: [
              { id: "name", label: "Name", type: "text" },
              { id: "currency", label: "Currency", type: "text" },
              {
                id: "principalAmount",
                label: "Principal amount",
                type: "text",
              },
              { id: "status", label: "Status", type: "text" },
              { id: "startDate", label: "Start date", type: "text" },
              { id: "endDate", label: "End date", type: "text" },
              { id: "templateId", label: "Template ID", type: "number" },
            ],
            id: "payment-plan-details",
            title: "Payment plan details",
          },
        ],
      },
      firstColumn: { sections: [] },
      secondColumn: { sections: [] },
    },
  };
