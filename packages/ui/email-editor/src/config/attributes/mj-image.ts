import { AttributeGroup } from "./types";

export const mjImageAttributeGroups: AttributeGroup[] = [
  {
    title: "Source",
    fields: [
      { key: "src", label: "Source URL" },
      { key: "alt", label: "Alt text" },
      { key: "title", label: "Title" },
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
      { key: "name", label: "Name" },
      { key: "usemap", label: "Usemap" },
      { key: "srcset", label: "Srcset" },
      { key: "sizes", label: "Sizes" },
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
      { key: "width", label: "Width" },
      { key: "height", label: "Height", placeholder: "auto" },
      { key: "max-height", label: "Max height" },
      {
        key: "fluid-on-mobile",
        label: "Fluid on mobile",
        type: "select",
        options: [
          { label: "True", value: "true" },
          { label: "False", value: "false" },
        ],
      },
    ],
  },
  {
    title: "Style",
    fields: [
      { key: "border", label: "Border" },
      { key: "border-top", label: "Border top" },
      { key: "border-right", label: "Border right" },
      { key: "border-bottom", label: "Border bottom" },
      { key: "border-left", label: "Border left" },
      { key: "border-radius", label: "Radius" },
      { key: "font-size", label: "Alt size" },
      { key: "padding", label: "Padding" },
      { key: "padding-top", label: "Padding top" },
      { key: "padding-right", label: "Padding right" },
      { key: "padding-bottom", label: "Padding bottom" },
      { key: "padding-left", label: "Padding left" },
    ],
  },
  {
    title: "Background",
    fields: [{ key: "container-background-color", label: "Container color" }],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
