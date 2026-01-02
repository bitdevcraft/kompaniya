import { AttributeGroup } from "./types";

export const tableRowAttributeGroups: AttributeGroup[] = [
  {
    title: "Layout",
    fields: [{ key: "height", label: "Height" }],
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
    fields: [
      { key: "class", label: "Class" },
      { key: "style", label: "Style" },
    ],
  },
];

export const tableCellAttributeGroups: AttributeGroup[] = [
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
        key: "valign",
        label: "Vertical align",
        type: "select",
        options: [
          { label: "Top", value: "top" },
          { label: "Middle", value: "middle" },
          { label: "Bottom", value: "bottom" },
        ],
      },
      { key: "colspan", label: "Column span" },
      { key: "rowspan", label: "Row span" },
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
    ],
  },
  {
    title: "Typography",
    fields: [
      { key: "color", label: "Color" },
      { key: "font-family", label: "Font family" },
      { key: "font-size", label: "Font size" },
      { key: "font-weight", label: "Font weight" },
      { key: "line-height", label: "Line height" },
      { key: "letter-spacing", label: "Letter spacing" },
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
      {
        key: "text-transform",
        label: "Transform",
        type: "select",
        options: [
          { label: "None", value: "none" },
          { label: "Capitalize", value: "capitalize" },
          { label: "Uppercase", value: "uppercase" },
          { label: "Lowercase", value: "lowercase" },
        ],
      },
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
    fields: [
      { key: "class", label: "Class" },
      { key: "style", label: "Style" },
    ],
  },
];
