import {
  RecordFieldOption,
  RecordPageLayout,
} from "@/components/record-page/layout";

import type { LeadRecordFormValues } from "./lead-record-schema";

const DEFAULT_SEGMENTATION_OPTIONS: RecordFieldOption[] = [
  { label: "item 1", value: "item 1" },
  { label: "item 2", value: "item 2" },
  { label: "item 3", value: "item 3" },
];

export const leadRecordLayout: RecordPageLayout<LeadRecordFormValues> = {
  header: {
    chips: [
      { fieldId: "email", icon: "mail", id: "lead-email", linkType: "mailto" },
      { fieldId: "phone", icon: "phone", id: "lead-phone", linkType: "tel" },
    ],
    metadata: [
      {
        fieldId: "createdAt",
        id: "lead-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "lead-updated",
        label: "Updated",
        type: "datetime",
      },
      {
        fieldId: "nextActivityAt",
        id: "lead-next",
        label: "Next activity",
        type: "datetime",
      },
    ],
    subtitle: [{ fieldId: "nationality", prefix: "Region: " }],
    title: {
      fallback: "Unqualified lead",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Primary lead information used by the sales and marketing teams.",
          fields: [
            { id: "lastName", label: "First name", type: "text" },
            { id: "firstName", label: "Last name", type: "text" },
            { id: "salutation", label: "Salutation", type: "text" },
            {
              id: "email",
              label: "Email",
              placeholder: "name@example.com",
              type: "text",
            },
            { id: "phone", label: "Phone", type: "phone" },
            { id: "nationality", label: "Region", type: "text" },
            { id: "score", label: "Lead score", type: "number" },
          ],
          id: "lead-profile",
          title: "Profile",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description:
            "Engagement milestones that determine if the team should follow up.",
          fields: [
            {
              id: "lastActivityAt",
              label: "Last activity",
              availableOnCreate: false,
              type: "datetime",
            },
            {
              id: "nextActivityAt",
              label: "Next activity",
              availableOnCreate: false,
              type: "datetime",
            },
            {
              colSpan: 2,
              description:
                "Notes, objections, and context gathered during discovery.",
              id: "notes",
              label: "Notes",
              type: "textarea",
            },
          ],
          id: "lead-engagement",
          title: "Engagement",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description:
            "Tags and categories help route and prioritize this lead.",
          fields: [
            {
              description:
                "Comma or line separated tags for campaigns and routing rules.",
              id: "tags",
              label: "Tags",
              placeholder: "Add tags…",
              options: DEFAULT_SEGMENTATION_OPTIONS,
              type: "multipicklist",
            },
            {
              description: "Categories control nurture tracks and reporting.",
              id: "categories",
              label: "Categories",
              placeholder: "Add categories…",
              options: DEFAULT_SEGMENTATION_OPTIONS,
              type: "multipicklist",
            },
          ],
          id: "lead-segmentation",
          title: "Segmentation",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
  ],
};
