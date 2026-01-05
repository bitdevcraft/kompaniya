import { applyPaddingStyles, NodeStyles, toTextAlign } from "./node-styles";

export const buildTableStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const innerStyles: React.CSSProperties = { width: "100%" };

  const align = attributes["align"];
  if (align) containerStyles.textAlign = toTextAlign(align);

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }
  if (attributes["color"]) innerStyles.color = attributes["color"];
  if (attributes["font-family"]) {
    innerStyles.fontFamily = attributes["font-family"];
  }
  if (attributes["font-size"]) innerStyles.fontSize = attributes["font-size"];
  if (attributes["line-height"]) {
    innerStyles.lineHeight = attributes["line-height"];
  }
  if (attributes["border"]) containerStyles.border = attributes["border"];
  if (attributes["width"]) innerStyles.width = attributes["width"];
  if (attributes["table-layout"]) {
    innerStyles.tableLayout = attributes["table-layout"] as "auto" | "fixed";
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, innerStyles };
};
