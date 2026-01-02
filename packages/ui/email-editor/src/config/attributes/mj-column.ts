import { AttributeGroup } from "./types";

export const mjColumnAttributeGroups: AttributeGroup[] = [
  {
    title: "Layout",
    fields: [
      { key: "width", label: "Width", placeholder: "100%" },
      {
        key: "vertical-align",
        label: "Vertical align",
        type: "select",
        options: [
          { label: "Top", value: "top" },
          { label: "Middle", value: "middle" },
          { label: "Bottom", value: "bottom" },
        ],
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
    ],
  },
  {
    title: "Background",
    fields: [
      { key: "background-color", label: "Background" },
      { key: "inner-background-color", label: "Inner background" },
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
      { key: "inner-border", label: "Inner border" },
      { key: "inner-border-top", label: "Inner border top" },
      { key: "inner-border-right", label: "Inner border right" },
      { key: "inner-border-bottom", label: "Inner border bottom" },
      { key: "inner-border-left", label: "Inner border left" },
      { key: "inner-border-radius", label: "Inner radius" },
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
