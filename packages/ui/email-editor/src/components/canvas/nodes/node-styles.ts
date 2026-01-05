export type NodeStyles = {
  containerStyles?: React.CSSProperties;
  contentStyles?: React.CSSProperties;
  innerStyles?: React.CSSProperties;
};

export const toTextAlign = (
  value?: string,
): React.CSSProperties["textAlign"] => {
  return value as React.CSSProperties["textAlign"];
};

export const toTextTransform = (
  value?: string,
): React.CSSProperties["textTransform"] => {
  return value as React.CSSProperties["textTransform"];
};

export const toDirection = (
  value?: string,
): React.CSSProperties["direction"] => {
  return value as React.CSSProperties["direction"];
};

export const toBorderTopStyle = (
  value?: string,
): React.CSSProperties["borderTopStyle"] => {
  return value as React.CSSProperties["borderTopStyle"];
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
