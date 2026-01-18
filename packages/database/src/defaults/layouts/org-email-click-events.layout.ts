/**
 * Default record layout for org_email_click_events
 */

export const orgEmailClickEventsLayout = {
  header: {
    title: { fieldId: "link", fallback: "Click event" },
    metadata: [
      {
        fieldId: "eventTimestamp",
        id: "click-time",
        label: "Clicked at",
        type: "datetime",
      },
      {
        fieldId: "orgEmailId",
        id: "click-email",
        label: "Email ID",
      },
    ],
    subtitle: [
      { fieldId: "link", prefix: "Link: " },
      { fieldId: "messageId", prefix: "Message: " },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Click events track when recipients click links within your emails.",
          fields: [
            {
              id: "link",
              label: "Clicked link",
              type: "text",
            },
            {
              id: "messageId",
              label: "Message ID",
              type: "text",
            },
          ],
          id: "click-details",
          title: "Click details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Information about the click event.",
          fields: [
            {
              id: "linkTags",
              label: "Link tags",
              type: "json",
            },
            {
              id: "userAgent",
              label: "User agent",
              type: "text",
              description: "Browser or email client that clicked the link",
            },
            {
              id: "eventTimestamp",
              label: "Event timestamp",
              type: "datetime",
            },
          ],
          id: "click-info",
          title: "Event information",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Related email and event records.",
          fields: [
            {
              id: "orgEmailEventId",
              label: "Email event ID",
              type: "text",
            },
            {
              id: "orgEmailId",
              label: "Email ID",
              type: "text",
            },
          ],
          id: "click-relations",
          title: "Related records",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
  ],
};
