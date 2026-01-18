/**
 * Default record layout for org_payment_plans
 */

export const orgPaymentPlansLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled plan" },
    metadata: [
      { fieldId: "status", id: "plan-status", label: "Status" },
      { fieldId: "currency", id: "plan-currency", label: "Currency" },
      {
        fieldId: "startDate",
        id: "plan-start",
        label: "Start date",
        type: "date",
      },
      { fieldId: "endDate", id: "plan-end", label: "End date", type: "date" },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          id: "plan-overview",
          title: "Plan Overview",
          fields: [
            { id: "name", label: "Plan name", type: "text" },
            {
              id: "templateId",
              label: "Template",
              type: "text",
              readOnly: true,
            },
            {
              id: "principalAmount",
              label: "Principal amount",
              type: "number",
              readOnly: true,
            },
            {
              id: "currency",
              label: "Currency",
              type: "text",
              readOnly: true,
            },
            { id: "status", label: "Status", type: "text", readOnly: true },
          ],
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          id: "schedule",
          title: "Payment Schedule",
          description: "All scheduled payments for this plan",
          fields: [
            {
              id: "instanceConfig.scheduleItems",
              label: "Schedule",
              type: "payment_schedule",
              readOnly: true,
            },
          ],
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          id: "events",
          title: "Key Events",
          fields: [
            {
              id: "instanceConfig.events.bookingDate",
              label: "Booking date",
              type: "date",
              readOnly: true,
            },
            {
              id: "instanceConfig.events.contractSigningDate",
              label: "Contract signing",
              type: "date",
              readOnly: true,
            },
            {
              id: "instanceConfig.events.handoverDate",
              label: "Handover date",
              type: "date",
              readOnly: true,
            },
          ],
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
