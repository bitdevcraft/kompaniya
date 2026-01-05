import { applyPaddingStyles, NodeStyles, toTextAlign } from "./node-styles";

export const buildCarouselStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};

  const align = attributes["align"];
  if (align) containerStyles.textAlign = toTextAlign(align);

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }

  if (attributes["border"]) containerStyles.border = attributes["border"];
  if (attributes["border-top"]) {
    containerStyles.borderTop = attributes["border-top"];
  }
  if (attributes["border-right"]) {
    containerStyles.borderRight = attributes["border-right"];
  }
  if (attributes["border-bottom"]) {
    containerStyles.borderBottom = attributes["border-bottom"];
  }
  if (attributes["border-left"]) {
    containerStyles.borderLeft = attributes["border-left"];
  }
  if (attributes["border-radius"]) {
    containerStyles.borderRadius = attributes["border-radius"];
  }

  if (attributes["width"]) containerStyles.width = attributes["width"];
  if (attributes["height"]) containerStyles.height = attributes["height"];

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles };
};
