import {
  applyPaddingStyles,
  NodeStyles,
  toBorderTopStyle,
} from "./node-styles";

export const buildDividerStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const borderTopStyle =
    toBorderTopStyle(attributes["border-style"]) ?? "solid";
  const lineStyles: React.CSSProperties = {
    borderTopWidth: attributes["border-width"] ?? "4px",
    borderTopStyle,
    borderTopColor: attributes["border-color"] ?? "#000000",
    width: attributes["width"] ?? "100%",
  };
  const hasPadding =
    attributes["padding"] ||
    attributes["padding-top"] ||
    attributes["padding-right"] ||
    attributes["padding-bottom"] ||
    attributes["padding-left"];

  const align = attributes["align"] ?? "center";
  if (align === "left") {
    lineStyles.marginRight = "auto";
  } else if (align === "right") {
    lineStyles.marginLeft = "auto";
  } else {
    lineStyles.marginLeft = "auto";
    lineStyles.marginRight = "auto";
  }

  if (attributes["container-background-color"]) {
    containerStyles.backgroundColor = attributes["container-background-color"];
  }

  if (!hasPadding) {
    containerStyles.padding = "10px 25px";
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles: lineStyles };
};

type MjDividerNodeProps = {
  contentStyles: React.CSSProperties;
};

export function MjDividerNode({ contentStyles }: MjDividerNodeProps) {
  return <div className="w-full" style={contentStyles} />;
}
