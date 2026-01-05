import { applyPaddingStyles, NodeStyles, toTextAlign } from "./node-styles";

export const buildHeroStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }

  if (attributes["background-url"]) {
    const url = attributes["background-url"];
    containerStyles.backgroundImage = url.startsWith("url(")
      ? url
      : `url(${url})`;
  }

  if (attributes["background-repeat"]) {
    containerStyles.backgroundRepeat = attributes["background-repeat"];
  }

  if (attributes["background-size"]) {
    containerStyles.backgroundSize = attributes["background-size"];
  }

  const position =
    attributes["background-position"] ||
    (attributes["background-position-x"] || attributes["background-position-y"]
      ? `${attributes["background-position-x"] ?? "left"} ${
          attributes["background-position-y"] ?? "top"
        }`
      : "");
  if (position) {
    containerStyles.backgroundPosition = position;
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

  if (attributes["align"]) {
    containerStyles.textAlign = toTextAlign(attributes["align"]);
  }
  if (attributes["vertical-align"]) {
    containerStyles.verticalAlign = attributes["vertical-align"];
  }
  if (attributes["height"]) containerStyles.height = attributes["height"];
  if (attributes["width"]) containerStyles.width = attributes["width"];

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles };
};
