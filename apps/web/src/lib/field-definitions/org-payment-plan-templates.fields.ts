import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Payment Plan Templates (org_payment_plan_templates)
 */
export const orgPaymentPlanTemplatesFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Template name",
    type: "text",
    category: "identity",
    group: "Template Info",
    sortOrder: 1,
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    category: "metadata",
    group: "Details",
    sortOrder: 1,
  },
  {
    id: "numberOfInstallments",
    label: "Number of installments",
    type: "number",
    category: "metadata",
    group: "Plan Configuration",
    sortOrder: 1,
  },
  {
    id: "interval",
    label: "Payment interval",
    type: "text",
    category: "metadata",
    group: "Plan Configuration",
    sortOrder: 2,
  },
  {
    id: "defaultAmount",
    label: "Default amount",
    type: "number",
    category: "metadata",
    group: "Plan Configuration",
    sortOrder: 3,
  },
];
