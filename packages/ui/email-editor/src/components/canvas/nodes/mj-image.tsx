/* eslint-disable @next/next/no-img-element */
import { applyPaddingStyles, NodeStyles } from "./node-styles";

export const buildImageStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const imageStyles: React.CSSProperties = {
    display: "block",
    maxWidth: "100%",
  };

  const align = attributes["align"];
  if (
    align === "left" ||
    align === "right" ||
    align === "center" ||
    align === "justify"
  ) {
    containerStyles.textAlign = align;
  }
  if (align === "center") {
    imageStyles.marginLeft = "auto";
    imageStyles.marginRight = "auto";
  } else if (align === "right") {
    imageStyles.marginLeft = "auto";
  }

  if (attributes["container-background-color"]) {
    containerStyles.backgroundColor = attributes["container-background-color"];
  }

  if (attributes["border"]) imageStyles.border = attributes["border"];
  if (attributes["border-top"])
    imageStyles.borderTop = attributes["border-top"];
  if (attributes["border-right"]) {
    imageStyles.borderRight = attributes["border-right"];
  }
  if (attributes["border-bottom"]) {
    imageStyles.borderBottom = attributes["border-bottom"];
  }
  if (attributes["border-left"])
    imageStyles.borderLeft = attributes["border-left"];
  if (attributes["border-radius"]) {
    imageStyles.borderRadius = attributes["border-radius"];
  }

  if (attributes["width"]) imageStyles.width = attributes["width"];
  imageStyles.height = attributes["height"] ?? "auto";
  if (attributes["max-height"]) {
    imageStyles.maxHeight = attributes["max-height"];
  }
  if (attributes["font-size"]) imageStyles.fontSize = attributes["font-size"];

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles: imageStyles };
};

type MjImageNodeProps = {
  attributes: Record<string, string>;
  contentStyles: React.CSSProperties;
};

export function MjImageNode({ attributes, contentStyles }: MjImageNodeProps) {
  return attributes["src"] ? (
    <img
      alt={attributes["alt"] ?? "Image"}
      src={attributes["src"]}
      style={contentStyles}
    />
  ) : (
    <div
      className="flex h-24 w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground"
      style={contentStyles}
    >
      Image
    </div>
  );
}
