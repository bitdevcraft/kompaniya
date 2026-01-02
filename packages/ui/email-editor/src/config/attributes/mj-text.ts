import { AttributeGroup } from "./types";

export const mjTextAttributeGroups: AttributeGroup[] = [
  {
    title: "Typography",
    fields: [
      {
        key: "align",
        label: "Align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
          { label: "Justify", value: "justify" },
        ],
      },
      { key: "color", label: "Color", placeholder: "#000000" },
      { key: "font-family", label: "Font family" },
      { key: "font-size", label: "Font size", placeholder: "13px" },
      {
        key: "font-style",
        label: "Font style",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Italic", value: "italic" },
          { label: "Oblique", value: "oblique" },
        ],
      },
      { key: "font-weight", label: "Font weight" },
      { key: "line-height", label: "Line height", placeholder: "1" },
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
    title: "Background",
    fields: [
      { key: "background-color", label: "Background", placeholder: "#ffffff" },
      {
        key: "container-background-color",
        label: "Container",
        placeholder: "#ffffff",
      },
    ],
  },
  {
    title: "Layout",
    fields: [{ key: "height", label: "Height" }],
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
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
