import { AttributeGroup } from "./types";

export const mjSectionAttributeGroups: AttributeGroup[] = [
  {
    title: "Layout",
    fields: [
      {
        key: "full-width",
        label: "Full width",
        type: "select",
        options: [
          { label: "Full width", value: "full-width" },
          { label: "False", value: "false" },
        ],
      },
      {
        key: "content-width",
        label: "Content width",
        placeholder: "600px",
      },
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { label: "LTR", value: "ltr" },
          { label: "RTL", value: "rtl" },
        ],
      },
      {
        key: "text-align",
        label: "Text align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
  },
  {
    title: "Background",
    fields: [
      { key: "background-color", label: "Color", placeholder: "#ffffff" },
      { key: "background-url", label: "Image URL" },
      {
        key: "background-repeat",
        label: "Repeat",
        type: "select",
        options: [
          { label: "Repeat", value: "repeat" },
          { label: "No repeat", value: "no-repeat" },
        ],
      },
      { key: "background-size", label: "Size", placeholder: "auto" },
      {
        key: "background-position",
        label: "Position",
        placeholder: "top center",
      },
      { key: "background-position-x", label: "Position X" },
      { key: "background-position-y", label: "Position Y" },
    ],
  },
  {
    title: "Spacing",
    fields: [
      { key: "padding", label: "Padding", placeholder: "20px 0" },
      { key: "padding-top", label: "Padding top" },
      { key: "padding-right", label: "Padding right" },
      { key: "padding-bottom", label: "Padding bottom" },
      { key: "padding-left", label: "Padding left" },
    ],
  },
  {
    title: "Border",
    fields: [
      { key: "border", label: "Border" },
      { key: "border-top", label: "Border top" },
      { key: "border-right", label: "Border right" },
      { key: "border-bottom", label: "Border bottom" },
      { key: "border-left", label: "Border left" },
      { key: "border-radius", label: "Radius" },
    ],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
