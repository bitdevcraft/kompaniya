/**
 * Default record layout for org_leads
 */

export const orgLeadsLayout = {
  header: {
    chips: [
      {
        fieldId: "email",
        icon: "mail",
        id: "lead-email",
        linkType: "mailto",
      },
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
            { id: "firstName", label: "First name", type: "text" },
            { id: "lastName", label: "Last name", type: "text" },
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
              tag: {
                relatedType: "lead",
              },
              type: "tag",
            },
            {
              description:
                "Categories for segmenting leads into different buckets.",
              id: "categories",
              label: "Categories",
              type: "json",
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
    { id: "deletedAt", label: "Deleted", readOnly: true, type: "datetime" },
    { id: "metadata", label: "Metadata", type: "json" },
  ],
};
