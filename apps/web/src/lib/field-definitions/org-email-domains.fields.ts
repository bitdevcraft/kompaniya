import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Email Domains (org_email_domains)
 */
export const orgEmailDomainsFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Domain",
    type: "text",
    category: "identity",
    group: "Domain Info",
    sortOrder: 1,
  },
  {
    id: "verified",
    label: "Verified",
    type: "boolean",
    category: "metadata",
    group: "Verification Status",
    sortOrder: 1,
  },
  {
    id: "status",
    label: "Status",
    type: "picklist",
    category: "metadata",
    group: "Verification Status",
    sortOrder: 2,
  },
  {
    id: "dkimStatus",
    label: "DKIM status",
    type: "text",
    category: "metadata",
    group: "Verification Status",
    sortOrder: 3,
  },
  {
    id: "spfStatus",
    label: "SPF status",
    type: "text",
    category: "metadata",
    group: "Verification Status",
    sortOrder: 4,
  },
  {
    id: "firstEmailSentAt",
    label: "Warm-up started",
    type: "datetime",
    category: "activity",
    group: "Warm-up",
    sortOrder: 1,
  },
  {
    id: "warmupCompletedAt",
    label: "Warm-up completed",
    type: "datetime",
    category: "activity",
    group: "Warm-up",
    sortOrder: 2,
  },
  {
    id: "dailyLimit",
    label: "Daily limit",
    type: "number",
    category: "metadata",
    group: "Warm-up",
    sortOrder: 3,
  },
];
