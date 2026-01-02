export type NodeStyles = {
  containerStyles?: React.CSSProperties;
  contentStyles?: React.CSSProperties;
  innerStyles?: React.CSSProperties;
};

export const applyPaddingStyles = (
  styles: React.CSSProperties,
  attributes: Record<string, string>,
) => {
  if (attributes["padding"]) styles.padding = attributes["padding"];
  if (attributes["padding-top"]) {
    styles.paddingTop = attributes["padding-top"];
  }
  if (attributes["padding-right"]) {
    styles.paddingRight = attributes["padding-right"];
  }
  if (attributes["padding-bottom"]) {
    styles.paddingBottom = attributes["padding-bottom"];
  }
  if (attributes["padding-left"]) {
    styles.paddingLeft = attributes["padding-left"];
  }
};
