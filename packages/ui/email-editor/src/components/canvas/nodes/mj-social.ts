import { applyPaddingStyles, NodeStyles, toTextAlign } from "./node-styles";

export const buildSocialStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const innerStyles: React.CSSProperties = {};
  const hasPadding =
    attributes["padding"] ||
    attributes["padding-top"] ||
    attributes["padding-right"] ||
    attributes["padding-bottom"] ||
    attributes["padding-left"];

  const align = attributes["align"];
  if (align) containerStyles.textAlign = toTextAlign(align);

  const containerBackground =
    attributes["container-background-color"] ?? attributes["background-color"];
  if (containerBackground) {
    containerStyles.backgroundColor = containerBackground;
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

  if (attributes["inner-padding"]) {
    innerStyles.gap = attributes["inner-padding"];
  }

  if (!hasPadding) {
    containerStyles.padding = "10px 25px";
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, innerStyles };
};
