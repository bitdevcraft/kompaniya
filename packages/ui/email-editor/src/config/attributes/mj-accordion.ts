import { AttributeGroup } from "./types";

export const mjAccordionAttributeGroups: AttributeGroup[] = [
  {
    title: "Layout",
    fields: [
      {
        key: "icon-align",
        label: "Icon align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      {
        key: "icon-position",
        label: "Icon position",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "icon-height", label: "Icon height" },
      { key: "icon-width", label: "Icon width" },
    ],
  },
  {
    title: "Typography",
    fields: [
      { key: "font-family", label: "Font family" },
      { key: "font-size", label: "Font size" },
      { key: "color", label: "Color" },
    ],
  },
  {
    title: "Style",
    fields: [
      { key: "background-color", label: "Background" },
      { key: "border", label: "Border" },
      { key: "border-top", label: "Border top" },
      { key: "border-right", label: "Border right" },
      { key: "border-bottom", label: "Border bottom" },
      { key: "border-left", label: "Border left" },
      { key: "border-radius", label: "Radius" },
    ],
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
