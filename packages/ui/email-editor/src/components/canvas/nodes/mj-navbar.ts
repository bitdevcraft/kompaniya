import { applyPaddingStyles, NodeStyles, toTextAlign } from "./node-styles";

export const buildNavbarStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};

  const align = attributes["align"];
  if (align) containerStyles.textAlign = toTextAlign(align);

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }
  if (attributes["color"]) containerStyles.color = attributes["color"];
  if (attributes["font-family"]) {
    containerStyles.fontFamily = attributes["font-family"];
  }
  if (attributes["font-size"]) {
    containerStyles.fontSize = attributes["font-size"];
  }
  if (attributes["line-height"]) {
    containerStyles.lineHeight = attributes["line-height"];
  }
  if (attributes["text-decoration"]) {
    containerStyles.textDecoration = attributes["text-decoration"];
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles };
};
