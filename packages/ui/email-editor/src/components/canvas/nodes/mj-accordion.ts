import { applyPaddingStyles, NodeStyles } from "./node-styles";

export const buildAccordionStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }
  if (attributes["font-family"]) {
    containerStyles.fontFamily = attributes["font-family"];
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

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles };
};
