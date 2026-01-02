import { applyPaddingStyles, NodeStyles } from "./node-styles";

export const buildSectionStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const styles: React.CSSProperties = {};
  const hasPadding =
    attributes["padding"] ||
    attributes["padding-top"] ||
    attributes["padding-right"] ||
    attributes["padding-bottom"] ||
    attributes["padding-left"];

  if (attributes["background-color"]) {
    styles.backgroundColor = attributes["background-color"];
  }

  if (attributes["background-url"]) {
    const url = attributes["background-url"];
    styles.backgroundImage = url.startsWith("url(") ? url : `url(${url})`;
  }

  if (attributes["background-repeat"]) {
    styles.backgroundRepeat = attributes["background-repeat"];
  }

  if (attributes["background-size"]) {
    styles.backgroundSize = attributes["background-size"];
  }

  const position =
    attributes["background-position"] ||
    (attributes["background-position-x"] || attributes["background-position-y"]
      ? `${attributes["background-position-x"] ?? "left"} ${
          attributes["background-position-y"] ?? "top"
        }`
      : "");
  if (position) {
    styles.backgroundPosition = position;
  }

  if (attributes["border"]) styles.border = attributes["border"];
  if (attributes["border-top"]) styles.borderTop = attributes["border-top"];
  if (attributes["border-right"])
    styles.borderRight = attributes["border-right"];
  if (attributes["border-bottom"]) {
    styles.borderBottom = attributes["border-bottom"];
  }
  if (attributes["border-left"]) styles.borderLeft = attributes["border-left"];
  if (attributes["border-radius"]) {
    styles.borderRadius = attributes["border-radius"];
  }
  if (attributes["text-align"]) styles.textAlign = attributes["text-align"];
  if (attributes["direction"]) styles.direction = attributes["direction"];

  if (!hasPadding) {
    styles.padding = "20px 0";
  }

  applyPaddingStyles(styles, attributes);

  return { containerStyles: styles };
};
