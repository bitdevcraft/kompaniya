import { AttributeGroup } from "./types";

export const mjNavbarLinkAttributeGroups: AttributeGroup[] = [
  {
    title: "Link",
    fields: [
      { key: "href", label: "Href" },
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
    ],
  },
  {
    title: "Typography",
    fields: [
      { key: "color", label: "Color", placeholder: "#ffffff" },
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
    fields: [{ key: "background-color", label: "Background" }],
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
