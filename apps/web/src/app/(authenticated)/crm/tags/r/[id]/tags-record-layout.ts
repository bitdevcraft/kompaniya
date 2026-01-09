import { type RecordPageLayout } from "@/components/record-page/layout";

export const tagsRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "tag-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "tag-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled tag",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Core tag attributes used for labeling and organization.",
          fields: [
            { id: "name", label: "Name", type: "text" },
            { id: "description", label: "Description", type: "textarea" },
          ],
          id: "tag-details",
          title: "Tag details",
        },
        {
          description: "Visual settings for tag display in the UI.",
          fields: [{ id: "color", label: "Color", type: "text" }],
          id: "tag-appearance",
          title: "Appearance",
        },
      ],
    },
  },
};
