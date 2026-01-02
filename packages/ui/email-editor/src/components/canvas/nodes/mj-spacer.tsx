import { applyPaddingStyles, NodeStyles } from "./node-styles";

export const buildSpacerStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const spacerStyles: React.CSSProperties = {
    height: attributes["height"] ?? "0px",
  };

  if (attributes["container-background-color"]) {
    containerStyles.backgroundColor = attributes["container-background-color"];
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles: spacerStyles };
};

type MjSpacerNodeProps = {
  contentStyles: React.CSSProperties;
};

export function MjSpacerNode({ contentStyles }: MjSpacerNodeProps) {
  return <div className="w-full" style={contentStyles} />;
}
