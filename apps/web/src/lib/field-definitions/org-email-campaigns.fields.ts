import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Email Campaigns (org_email_campaigns)
 */
export const orgEmailCampaignsFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Campaign name",
    type: "text",
    category: "identity",
    group: "Campaign Info",
    sortOrder: 1,
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    category: "metadata",
    group: "Campaign Status",
    sortOrder: 1,
  },
  {
    id: "subject",
    label: "Subject",
    type: "text",
    category: "metadata",
    group: "Content",
    sortOrder: 1,
  },
  {
    id: "scheduledAt",
    label: "Scheduled for",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 1,
  },
  {
    id: "sentAt",
    label: "Sent at",
    type: "datetime",
    category: "activity",
    group: "Scheduling",
    sortOrder: 2,
  },
];
