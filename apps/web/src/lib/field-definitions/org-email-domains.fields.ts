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
    id: "dkimStatus",
    label: "DKIM status",
    type: "text",
    category: "metadata",
    group: "Verification Status",
    sortOrder: 2,
  },
  {
    id: "spfStatus",
    label: "SPF status",
    type: "text",
    category: "metadata",
    group: "Verification Status",
    sortOrder: 3,
  },
];
