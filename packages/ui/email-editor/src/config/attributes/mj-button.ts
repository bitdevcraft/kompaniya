import { AttributeGroup } from "./types";

export const mjButtonAttributeGroups: AttributeGroup[] = [
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
        key: "text-align",
        label: "Text align",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
      {
        key: "vertical-align",
        label: "Vertical align",
        type: "select",
        options: [
          { label: "Top", value: "top" },
          { label: "Middle", value: "middle" },
          { label: "Bottom", value: "bottom" },
          { label: "Vertical", value: "vertical" },
        ],
      },
    ],
  },
  {
    title: "Colors",
    fields: [
      { key: "background-color", label: "Background", placeholder: "#414141" },
      { key: "color", label: "Text color", placeholder: "#ffffff" },
      {
        key: "container-background-color",
        label: "Container",
      },
    ],
  },
  {
    title: "Typography",
    fields: [
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
      { key: "font-weight", label: "Font weight", placeholder: "normal" },
      { key: "line-height", label: "Line height", placeholder: "120%" },
      { key: "letter-spacing", label: "Letter spacing" },
      {
        key: "text-decoration",
        label: "Decoration",
        type: "select",
        options: [
          { label: "None", value: "none" },
          { label: "Underline", value: "underline" },
          { label: "Overline", value: "overline" },
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
    title: "Border",
    fields: [
      { key: "border", label: "Border", placeholder: "none" },
      { key: "border-top", label: "Border top" },
      { key: "border-right", label: "Border right" },
      { key: "border-bottom", label: "Border bottom" },
      { key: "border-left", label: "Border left" },
      { key: "border-radius", label: "Radius", placeholder: "3px" },
    ],
  },
  {
    title: "Spacing",
    fields: [
      { key: "padding", label: "Container padding", placeholder: "10px 25px" },
      { key: "padding-top", label: "Padding top" },
      { key: "padding-right", label: "Padding right" },
      { key: "padding-bottom", label: "Padding bottom" },
      { key: "padding-left", label: "Padding left" },
      {
        key: "inner-padding",
        label: "Inner padding",
        placeholder: "10px 25px",
      },
    ],
  },
  {
    title: "Link",
    fields: [
      { key: "href", label: "Link" },
      {
        key: "target",
        label: "Target",
        type: "select",
        options: [
          { label: "Blank", value: "_blank" },
          { label: "Self", value: "_self" },
          { label: "Parent", value: "_parent" },
          { label: "Top", value: "_top" },
        ],
      },
      { key: "rel", label: "Rel" },
      { key: "title", label: "Title" },
      { key: "name", label: "Name" },
    ],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
