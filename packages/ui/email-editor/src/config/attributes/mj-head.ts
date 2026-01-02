import { AttributeGroup } from "./types";

const typographyFields = [
  {
    key: "align",
    label: "Align",
    type: "select" as const,
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
  { key: "font-weight", label: "Font weight" },
  { key: "line-height", label: "Line height", placeholder: "1" },
  { key: "letter-spacing", label: "Letter spacing" },
  {
    key: "text-decoration",
    label: "Decoration",
    type: "select" as const,
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
    type: "select" as const,
    options: [
      { label: "None", value: "none" },
      { label: "Capitalize", value: "capitalize" },
      { label: "Uppercase", value: "uppercase" },
      { label: "Lowercase", value: "lowercase" },
    ],
  },
];

const backgroundFields = [
  { key: "background-color", label: "Background", placeholder: "#ffffff" },
];

const spacingFields = [
  { key: "padding", label: "Padding", placeholder: "10px 25px" },
  { key: "padding-top", label: "Padding top" },
  { key: "padding-right", label: "Padding right" },
  { key: "padding-bottom", label: "Padding bottom" },
  { key: "padding-left", label: "Padding left" },
];

export const mjAllAttributeGroups: AttributeGroup[] = [
  { title: "Typography", fields: typographyFields },
  { title: "Background", fields: backgroundFields },
  { title: "Spacing", fields: spacingFields },
];

export const mjClassAttributeGroups: AttributeGroup[] = [
  {
    title: "Class",
    fields: [{ key: "name", label: "Name", placeholder: "blue" }],
  },
  { title: "Typography", fields: typographyFields },
  { title: "Background", fields: backgroundFields },
  { title: "Spacing", fields: spacingFields },
];

export const mjFontAttributeGroups: AttributeGroup[] = [
  {
    title: "Font",
    fields: [
      { key: "name", label: "Name", placeholder: "Raleway" },
      { key: "href", label: "Href", placeholder: "https://..." },
    ],
  },
];

export const mjBreakpointAttributeGroups: AttributeGroup[] = [
  {
    title: "Breakpoint",
    fields: [{ key: "width", label: "Width", placeholder: "320px" }],
  },
];

export const mjStyleAttributeGroups: AttributeGroup[] = [
  {
    title: "Style",
    fields: [
      {
        key: "inline",
        label: "Inline",
        type: "select",
        options: [{ label: "Inline", value: "inline" }],
      },
    ],
  },
];

export const mjSelectorAttributeGroups: AttributeGroup[] = [
  {
    title: "Selector",
    fields: [{ key: "path", label: "Path", placeholder: ".custom div" }],
  },
];

export const mjHtmlAttributeAttributeGroups: AttributeGroup[] = [
  {
    title: "Attribute",
    fields: [{ key: "name", label: "Name", placeholder: "data-id" }],
  },
];
