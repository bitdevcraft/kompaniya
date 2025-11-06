import type { RecordPageLayout } from "@/components/record-page";

import type { LeadRecordFormValues } from "./lead-record-schema";

export const leadRecordLayout: RecordPageLayout<LeadRecordFormValues> = {
  header: {
    chips: [
      { fieldId: "email", icon: "mail", id: "lead-email", linkType: "mailto" },
      { fieldId: "phone", icon: "phone", id: "lead-phone", linkType: "tel" },
    ],
    metadata: [
      { fieldId: "createdAt", id: "lead-created", label: "Created", type: "datetime" },
      { fieldId: "updatedAt", id: "lead-updated", label: "Updated", type: "datetime" },
      { fieldId: "nextActivityAt", id: "lead-next", label: "Next activity", type: "datetime" },
    ],
    subtitle: [
      { fieldId: "nationality", prefix: "Region: " },
    ],
    title: {
      fallback: "Unqualified lead",
      fieldId: "name",
    },
  },
  sections: [
    {
      description: "Primary lead information used by the sales and marketing teams.",
      fields: [
        { id: "name", label: "Full name", type: "text" },
        { id: "salutation", label: "Salutation", type: "text" },
        { id: "email", label: "Email", placeholder: "name@example.com", type: "text" },
        { id: "phone", label: "Phone", type: "text" },
        { id: "nationality", label: "Region", type: "text" },
        { id: "score", label: "Lead score", type: "number" },
      ],
      id: "lead-profile",
      title: "Profile",
    },
    {
      description: "Engagement milestones that determine if the team should follow up.",
      fields: [
        {
          id: "lastActivityAt",
          label: "Last activity",
          type: "datetime",
        },
        {
          id: "nextActivityAt",
          label: "Next activity",
          type: "datetime",
        },
        {
          colSpan: 2,
          description: "Notes, objections, and context gathered during discovery.",
          id: "notes",
          label: "Notes",
          multiline: true,
          type: "text",
        },
      ],
      id: "lead-engagement",
      title: "Engagement",
    },
    {
      description: "Tags and categories help route and prioritize this lead.",
      fields: [
        {
          description: "Comma or line separated tags for campaigns and routing rules.",
          id: "tags",
          label: "Tags",
          placeholder: "Add tags…",
          type: "multipicklist",
        },
        {
          description: "Categories control nurture tracks and reporting.",
          id: "categories",
          label: "Categories",
          placeholder: "Add categories…",
          type: "multipicklist",
        },
      ],
      id: "lead-segmentation",
      title: "Segmentation",
    },
  ],
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
  ],
};
