import { AttributeGroup } from "./types";

export const mjSocialAttributeGroups: AttributeGroup[] = [
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
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: [
          { label: "Horizontal", value: "horizontal" },
          { label: "Vertical", value: "vertical" },
        ],
      },
      {
        key: "container-background-color",
        label: "Container background",
      },
    ],
  },
  {
    title: "Icons",
    fields: [
      { key: "icon-size", label: "Icon size" },
      { key: "icon-height", label: "Icon height" },
      { key: "icon-padding", label: "Icon padding" },
      { key: "border-radius", label: "Icon radius" },
    ],
  },
  {
    title: "Typography",
    fields: [
      { key: "color", label: "Color" },
      { key: "font-family", label: "Font family" },
      { key: "font-size", label: "Font size" },
      { key: "line-height", label: "Line height" },
      {
        key: "text-decoration",
        label: "Decoration",
        type: "select",
        options: [
          { label: "None", value: "none" },
          { label: "Underline", value: "underline" },
          { label: "Overline", value: "overline" },
          { label: "Line through", value: "line-through" },
        ],
      },
    ],
  },
  {
    title: "Spacing",
    fields: [
      { key: "inner-padding", label: "Inner padding" },
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
