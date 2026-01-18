/**
 * Default record layout for org_tags
 */

export const orgTagsLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled tag" },
    metadata: [
      {
        fieldId: "createdAt",
        id: "tag-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "relatedType",
        id: "tag-type",
        label: "Entity type",
      },
    ],
    subtitle: [{ fieldId: "relatedType", prefix: "Used for: " }],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Tags are flexible labels used to categorize and filter records across different entity types.",
          fields: [
            { id: "name", label: "Tag name", type: "text" },
            {
              id: "relatedType",
              label: "Related entity type",
              type: "text",
              description:
                "The type of entity this tag can be applied to (e.g., contact, lead, account)",
            },
          ],
          id: "tag-details",
          title: "Tag details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Owner information for this tag.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "tag-ownership",
          title: "Ownership",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "System timestamps for tracking.",
          fields: [
            {
              id: "createdAt",
              label: "Created at",
              type: "datetime",
              readOnly: true,
            },
            {
              id: "updatedAt",
              label: "Updated at",
              type: "datetime",
              readOnly: true,
            },
          ],
          id: "tag-timestamps",
          title: "Timestamps",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
  ],
};
