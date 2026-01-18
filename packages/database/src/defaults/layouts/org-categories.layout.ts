/**
 * Default record layout for org_categories
 */

export const orgCategoriesLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled category" },
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
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Categories are used to group and organize records across your organization.",
          fields: [{ id: "name", label: "Category name", type: "text" }],
          id: "category-details",
          title: "Category details",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Custom fields configured for your categories.",
          fields: [
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "category-custom",
          title: "Custom fields",
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
          id: "category-tracking",
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
