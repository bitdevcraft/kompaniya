import { AttributeGroup } from "./types";

export const mjCarouselAttributeGroups: AttributeGroup[] = [
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
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
    ],
  },
  {
    title: "Icons",
    fields: [
      { key: "left-icon", label: "Left icon" },
      { key: "right-icon", label: "Right icon" },
      { key: "icon-width", label: "Icon width" },
      { key: "icon-height", label: "Icon height" },
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
