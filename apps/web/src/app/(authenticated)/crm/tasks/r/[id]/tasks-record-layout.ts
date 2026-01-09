import { type RecordPageLayout } from "@/components/record-page/layout";

export const tasksRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "task-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "task-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled task",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Core task attributes and description.",
          fields: [
            { id: "name", label: "Task name", type: "text" },
            { id: "description", label: "Description", type: "textarea" },
          ],
          id: "task-details",
          title: "Task details",
        },
        {
          description: "Track task completion and priority levels.",
          fields: [
            { id: "status", label: "Status", type: "text" },
            { id: "priority", label: "Priority", type: "text" },
          ],
          id: "task-status",
          title: "Status",
        },
        {
          description: "Schedule and track task deadlines.",
          fields: [
            { id: "dueDate", label: "Due date", type: "datetime" },
            {
              availableOnCreate: false,
              id: "completedAt",
              label: "Completed at",
              readOnly: true,
              type: "datetime",
            },
          ],
          id: "task-scheduling",
          title: "Scheduling",
        },
      ],
    },
  },
};
