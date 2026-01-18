/**
 * Default record layout for org_payment_plan_templates
 */

export const orgPaymentPlanTemplatesLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled template" },
    metadata: [
      { fieldId: "code", id: "template-code", label: "Code" },
      { fieldId: "isActive", id: "template-active", label: "Active" },
      {
        fieldId: "createdAt",
        id: "template-created",
        label: "Created",
        type: "datetime",
      },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          id: "template-info",
          title: "Template Information",
          fields: [
            { id: "name", label: "Template name", type: "text" },
            { id: "code", label: "Code", type: "text" },
            { id: "description", label: "Description", type: "textarea" },
            {
              id: "defaultCurrency",
              label: "Default currency",
              type: "text",
            },
            { id: "subjectType", label: "Subject type", type: "text" },
            {
              id: "minPrincipal",
              label: "Minimum principal",
              type: "number",
            },
            {
              id: "maxPrincipal",
              label: "Maximum principal",
              type: "number",
            },
            { id: "isActive", label: "Is active", type: "boolean" },
          ],
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          id: "milestones",
          title: "Payment Milestones",
          description: "Configure when payments are due",
          fields: [
            {
              id: "templateConfig.milestones",
              label: "Milestone Configuration",
              type: "payment_plan_milestones",
              readOnly: true,
            },
          ],
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          id: "fee-rules",
          title: "Fee Rules",
          description: "Configure additional fees and charges",
          fields: [
            {
              id: "templateConfig.feeRules",
              label: "Fee Configuration",
              type: "payment_plan_fees",
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
