import { AttributeGroup } from "./types";

export const mjDividerAttributeGroups: AttributeGroup[] = [
  {
    title: "Layout",
    fields: [
      {
        key: "align",
        label: "Align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "width", label: "Width", placeholder: "100%" },
    ],
  },
  {
    title: "Border",
    fields: [
      { key: "border-color", label: "Color", placeholder: "#000000" },
      {
        key: "border-style",
        label: "Style",
        type: "select",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Dashed", value: "dashed" },
          { label: "Dotted", value: "dotted" },
        ],
      },
      { key: "border-width", label: "Width", placeholder: "4px" },
    ],
  },
  {
    title: "Spacing",
    fields: [
      { key: "padding", label: "Padding", placeholder: "10px 25px" },
      { key: "padding-top", label: "Padding top" },
      { key: "padding-right", label: "Padding right" },
      { key: "padding-bottom", label: "Padding bottom" },
      { key: "padding-left", label: "Padding left" },
    ],
  },
  {
    title: "Background",
    fields: [{ key: "container-background-color", label: "Container color" }],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
