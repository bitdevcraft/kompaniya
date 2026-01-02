import { AttributeGroup } from "./types";

export const mjHeroAttributeGroups: AttributeGroup[] = [
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
        key: "vertical-align",
        label: "Vertical align",
        type: "select",
        options: [
          { label: "Top", value: "top" },
          { label: "Middle", value: "middle" },
          { label: "Bottom", value: "bottom" },
        ],
      },
      { key: "height", label: "Height" },
      { key: "width", label: "Width" },
    ],
  },
  {
    title: "Background",
    fields: [
      { key: "background-color", label: "Color" },
      { key: "background-url", label: "Image URL" },
      {
        key: "background-repeat",
        label: "Repeat",
        type: "select",
        options: [
          { label: "Repeat", value: "repeat" },
          { label: "No repeat", value: "no-repeat" },
        ],
      },
      { key: "background-size", label: "Size", placeholder: "cover" },
      { key: "background-position", label: "Position", placeholder: "center" },
      { key: "background-position-x", label: "Position X" },
      { key: "background-position-y", label: "Position Y" },
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
