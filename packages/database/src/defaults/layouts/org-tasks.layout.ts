/**
 * Default record layout for org_tasks
 */

export const orgTasksLayout = {
  header: {
    title: { fieldId: "id", fallback: "Task" },
    metadata: [
      {
        fieldId: "runBy",
        id: "task-due",
        label: "Due date",
        type: "datetime",
      },
      {
        fieldId: "createdAt",
        id: "task-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "ownerId",
        id: "task-owner",
        label: "Owner",
      },
    ],
    subtitle: [
      { fieldId: "relatedType", prefix: "Related: " },
      { fieldId: "relatedId", prefix: "ID: " },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Task scheduling and relationship information.",
          fields: [
            {
              id: "runBy",
              label: "Run by (due date)",
              type: "datetime",
            },
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
          id: "task-details",
          title: "Task details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Owner and creation tracking.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
            { id: "deletedBy", label: "Deleted by", type: "text" },
          ],
          id: "task-ownership",
          title: "Ownership",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Additional metadata associated with this task.",
          fields: [
            { id: "metadata", label: "Metadata", type: "json" },
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "task-metadata",
          title: "Metadata",
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
