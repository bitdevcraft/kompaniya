/**
 * Default record layout for org_activities
 */

export const orgActivitiesLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled activity" },
    metadata: [
      {
        fieldId: "createdAt",
        id: "activity-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "activity-updated",
        label: "Updated",
        type: "datetime",
      },
      {
        fieldId: "ownerId",
        id: "activity-owner",
        label: "Owner",
      },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Core activity attributes captured in your CRM.",
          fields: [
            { id: "name", label: "Activity name", type: "text" },
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "activity-details",
          title: "Activity details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Custom fields configured for your organization.",
          fields: [
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "activity-custom",
          title: "Custom fields",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "System timestamps and metadata.",
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
            {
              id: "deletedAt",
              label: "Deleted at",
              type: "datetime",
              readOnly: true,
            },
          ],
          id: "activity-timestamps",
          title: "Timestamps",
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
