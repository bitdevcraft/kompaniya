import { AttributeGroup } from "./types";

export const mjTableAttributeGroups: AttributeGroup[] = [
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
      {
        key: "table-layout",
        label: "Table layout",
        type: "select",
        options: [
          { label: "Auto", value: "auto" },
          { label: "Fixed", value: "fixed" },
        ],
      },
    ],
  },
  {
    title: "Typography",
    fields: [
      { key: "color", label: "Color" },
      { key: "font-family", label: "Font family" },
      { key: "font-size", label: "Font size" },
      { key: "line-height", label: "Line height" },
    ],
  },
  {
    title: "Table",
    fields: [
      { key: "border", label: "Border" },
      { key: "cellpadding", label: "Cell padding" },
      { key: "cellspacing", label: "Cell spacing" },
    ],
  },
  {
    title: "Advanced",
    fields: [{ key: "css-class", label: "CSS class" }],
  },
];
