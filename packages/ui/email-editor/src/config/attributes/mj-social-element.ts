import { AttributeGroup } from "./types";

export const mjSocialElementAttributeGroups: AttributeGroup[] = [
  {
    title: "Network",
    fields: [
      { key: "name", label: "Name", placeholder: "facebook" },
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
        key: "icon-position",
        label: "Icon position",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
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
    ],
  },
  {
    title: "Icon",
    fields: [
      { key: "src", label: "Icon src" },
      { key: "srcset", label: "Srcset" },
      { key: "sizes", label: "Sizes" },
      { key: "alt", label: "Alt text" },
      { key: "title", label: "Title" },
      { key: "background-color", label: "Background" },
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
      { key: "font-style", label: "Font style" },
      { key: "font-weight", label: "Font weight" },
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
      { key: "text-padding", label: "Text padding" },
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
