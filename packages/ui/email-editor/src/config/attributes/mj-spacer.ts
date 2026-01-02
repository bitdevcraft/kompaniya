import { AttributeGroup } from "./types";

export const mjSpacerAttributeGroups: AttributeGroup[] = [
  {
    title: "Layout",
    fields: [{ key: "height", label: "Height", placeholder: "0px" }],
  },
  {
    title: "Background",
    fields: [{ key: "container-background-color", label: "Container color" }],
  },
  {
    title: "Spacing",
    fields: [
      { key: "padding", label: "Padding" },
      { key: "padding-top", label: "Padding top" },
      { key: "padding-right", label: "Padding right" },
      { key: "padding-bottom", label: "Padding bottom" },
      { key: "padding-left", label: "Padding left" },
    ],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
