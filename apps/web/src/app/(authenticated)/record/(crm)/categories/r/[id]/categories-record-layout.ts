import { type RecordPageLayout } from "@/components/record-page/layout";

export const categoriesRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "category-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "category-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled category",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Core category attributes used for segmentation and organization.",
          fields: [
            { id: "name", label: "Name", type: "text" },
            { id: "description", label: "Description", type: "textarea" },
          ],
          id: "category-details",
          title: "Category details",
        },
        {
          description: "Visual settings for category display in the UI.",
          fields: [
            { id: "color", label: "Color", type: "text" },
            { id: "icon", label: "Icon", type: "text" },
          ],
          id: "category-appearance",
          title: "Appearance",
        },
      ],
    },
  },
};
