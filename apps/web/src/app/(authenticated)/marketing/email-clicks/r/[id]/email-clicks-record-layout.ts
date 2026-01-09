import { type RecordPageLayout } from "@/components/record-page/layout";

export const emailClicksRecordLayout: RecordPageLayout = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "click-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "click-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    title: {
      fallback: "Untitled click",
      fieldId: "link",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description: "Click tracking details and associated links.",
          fields: [{ id: "link", label: "Link", type: "text" }],
          id: "click-details",
          title: "Click details",
        },
        {
          description: "Associated email and domain records.",
          fields: [
            {
              id: "orgEmailId",
              label: "Email ID",
              type: "text",
            },
            {
              id: "orgEmailDomainId",
              label: "Domain ID",
              type: "text",
            },
          ],
          id: "click-associations",
          title: "Associations",
        },
      ],
    },
  },
};
