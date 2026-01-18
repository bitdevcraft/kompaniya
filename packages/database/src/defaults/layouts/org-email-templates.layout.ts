/**
 * Default record layout for org_email_templates
 */

export const orgEmailTemplatesLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled template" },
    metadata: [
      {
        fieldId: "createdAt",
        id: "template-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "template-updated",
        label: "Updated",
        type: "datetime",
      },
      {
        fieldId: "subject",
        id: "template-subject",
        label: "Subject",
      },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Email templates define reusable content for campaigns and automated emails.",
          fields: [
            { id: "name", label: "Template name", type: "text" },
            {
              id: "subject",
              label: "Email subject",
              type: "text",
            },
          ],
          id: "template-details",
          title: "Template details",
        },
        {
          description:
            "Design your email using the MJML visual editor for responsive, professional emails.",
          fields: [
            {
              id: "mjmlJsonContent",
              label: "Email body (MJML)",
              type: "mjml",
              description:
                "Use the visual editor to craft responsive email content.",
            },
          ],
          id: "template-content",
          title: "Content",
          columns: 1,
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Additional template content options.",
          fields: [
            {
              id: "body",
              label: "Plain body",
              type: "textarea",
            },
            {
              id: "mjmlContent",
              label: "MJML source",
              type: "textarea",
            },
            {
              id: "htmlContent",
              label: "HTML preview",
              type: "textarea",
            },
          ],
          id: "template-sources",
          title: "Source content",
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
          ],
          id: "template-tracking",
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
