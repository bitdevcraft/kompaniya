import { AttributeGroup } from "./types";

export const mjRawAttributeGroups: AttributeGroup[] = [
  {
    title: "Placement",
    fields: [
      {
        key: "position",
        label: "Position",
        type: "select",
        options: [{ label: "File start", value: "file-start" }],
        placeholder: "Body",
      },
    ],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
