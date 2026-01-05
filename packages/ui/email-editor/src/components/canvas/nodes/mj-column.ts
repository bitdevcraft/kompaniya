import { applyPaddingStyles, NodeStyles, toDirection } from "./node-styles";

export const buildColumnStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const innerStyles: React.CSSProperties = {};

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

  if (attributes["inner-background-color"]) {
    innerStyles.backgroundColor = attributes["inner-background-color"];
  }
  if (attributes["inner-border"])
    innerStyles.border = attributes["inner-border"];
  if (attributes["inner-border-top"]) {
    innerStyles.borderTop = attributes["inner-border-top"];
  }
  if (attributes["inner-border-right"]) {
    innerStyles.borderRight = attributes["inner-border-right"];
  }
  if (attributes["inner-border-bottom"]) {
    innerStyles.borderBottom = attributes["inner-border-bottom"];
  }
  if (attributes["inner-border-left"]) {
    innerStyles.borderLeft = attributes["inner-border-left"];
  }
  if (attributes["inner-border-radius"]) {
    innerStyles.borderRadius = attributes["inner-border-radius"];
  }

  return { containerStyles, innerStyles };
};
