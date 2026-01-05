import { applyPaddingStyles, NodeStyles, toDirection } from "./node-styles";

export const buildGroupStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};

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

  if (attributes["direction"]) {
    containerStyles.direction = toDirection(attributes["direction"]);
  }
  if (attributes["width"]) containerStyles.width = attributes["width"];
  if (attributes["vertical-align"]) {
    containerStyles.verticalAlign = attributes["vertical-align"];
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles };
};
