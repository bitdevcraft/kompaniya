/**
 * Default record layout for org_email_test_receivers
 */

export const orgEmailTestReceiversLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled test receiver" },
    metadata: [
      {
        fieldId: "createdAt",
        id: "receiver-created",
        label: "Created",
        type: "datetime",
      },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Test receiver groups allow you to send test emails to multiple recipients before launching campaigns.",
          fields: [{ id: "name", label: "Receiver group name", type: "text" }],
          id: "receiver-details",
          title: "Receiver group",
        },
        {
          description:
            "Add email addresses that will receive test campaigns. Enter one email per line.",
          columns: 1,
          fields: [
            {
              id: "emails",
              label: "Test email addresses",
              type: "json",
              description:
                "Array of email addresses that will receive test emails",
            },
          ],
          id: "receiver-emails",
          title: "Email list",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Owner and tracking information.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "receiver-tracking",
          title: "Tracking",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Custom fields configured for your organization.",
          fields: [
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "receiver-custom",
          title: "Custom fields",
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
