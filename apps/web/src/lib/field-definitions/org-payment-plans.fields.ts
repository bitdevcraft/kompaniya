import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Payment Plans (org_payment_plans)
 */
export const orgPaymentPlansFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Plan name",
    type: "text",
    category: "identity",
    group: "Plan Info",
    sortOrder: 1,
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    category: "metadata",
    group: "Plan Status",
    sortOrder: 1,
  },
  {
    id: "totalAmount",
    label: "Total amount",
    type: "number",
    category: "metadata",
    group: "Financial Details",
    sortOrder: 1,
  },
  {
    id: "paidAmount",
    label: "Paid amount",
    type: "number",
    category: "metadata",
    group: "Financial Details",
    sortOrder: 2,
  },
  {
    id: "remainingAmount",
    label: "Remaining amount",
    type: "number",
    category: "metadata",
    group: "Financial Details",
    sortOrder: 3,
  },
  {
    id: "startDate",
    label: "Start date",
    type: "date",
    category: "activity",
    group: "Schedule",
    sortOrder: 1,
  },
  {
    id: "endDate",
    label: "End date",
    type: "date",
    category: "activity",
    group: "Schedule",
    sortOrder: 2,
  },
];
