import {
  applyPaddingStyles,
  NodeStyles,
  toTextAlign,
  toTextTransform,
} from "./node-styles";

const resolveVerticalAlign = (value?: string) => {
  if (value === "middle") return "center";
  if (value === "bottom") return "flex-end";
  return "flex-start";
};

export const buildTableRowStyles = (
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
  if (attributes["height"]) containerStyles.height = attributes["height"];

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles };
};

export const buildTableCellStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: resolveVerticalAlign(attributes["valign"]),
  };
  const contentStyles: React.CSSProperties = { width: "100%" };

  const align = attributes["align"];
  if (align) contentStyles.textAlign = toTextAlign(align);

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

  if (attributes["color"]) contentStyles.color = attributes["color"];
  if (attributes["font-family"]) {
    contentStyles.fontFamily = attributes["font-family"];
  }
  if (attributes["font-size"]) {
    contentStyles.fontSize = attributes["font-size"];
  }
  if (attributes["font-weight"]) {
    contentStyles.fontWeight = attributes["font-weight"];
  }
  if (attributes["line-height"]) {
    contentStyles.lineHeight = attributes["line-height"];
  }
  if (attributes["letter-spacing"]) {
    contentStyles.letterSpacing = attributes["letter-spacing"];
  }
  if (attributes["text-decoration"]) {
    contentStyles.textDecoration = attributes["text-decoration"];
  }
  if (attributes["text-transform"]) {
    contentStyles.textTransform = toTextTransform(attributes["text-transform"]);
  }
  if (attributes["width"]) containerStyles.width = attributes["width"];
  if (attributes["height"]) containerStyles.height = attributes["height"];

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles };
};

export const buildTableHeaderCellStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const styles = buildTableCellStyles(attributes);
  if (!attributes["font-weight"]) {
    styles.contentStyles = {
      ...(styles.contentStyles ?? {}),
      fontWeight: "700",
    };
  }
  return styles;
};
