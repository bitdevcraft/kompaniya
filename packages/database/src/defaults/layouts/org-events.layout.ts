/**
 * Default record layout for org_events
 */

export const orgEventsLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled event" },
    metadata: [
      {
        fieldId: "createdAt",
        id: "event-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "relatedType",
        id: "event-type",
        label: "Related type",
      },
      {
        fieldId: "ownerId",
        id: "event-owner",
        label: "Owner",
      },
    ],
    subtitle: [
      { fieldId: "relatedType", prefix: "Type: " },
      { fieldId: "relatedId", prefix: "Record: " },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Event identification and relationship information.",
          fields: [
            { id: "name", label: "Event name", type: "text" },
            {
              id: "relatedId",
              label: "Related record ID",
              type: "text",
            },
            {
              id: "relatedType",
              label: "Related record type",
              type: "text",
            },
          ],
          id: "event-details",
          title: "Event details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Event payload and metadata.",
          fields: [
            { id: "payload", label: "Event payload", type: "json" },
            { id: "metadata", label: "Event metadata", type: "json" },
          ],
          id: "event-payload",
          title: "Payload",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Owner and tracking information.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "event-tracking",
          title: "Tracking",
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
