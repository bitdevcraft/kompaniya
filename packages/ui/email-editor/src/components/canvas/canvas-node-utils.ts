export const getJustifyClass = (align?: string) =>
  align === "center"
    ? "justify-center"
    : align === "right"
      ? "justify-end"
      : "justify-start";

export const getAlignItemsClass = (align?: string) =>
  align === "center"
    ? "items-center"
    : align === "right"
      ? "items-end"
      : "items-start";

export const parseCellSpacing = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && trimmed === String(numeric)
    ? numeric
    : trimmed;
};

export const getColumnStyle = (
  attributes?: Record<string, string | undefined>,
) => {
  const columnWidth = attributes?.width;
  const verticalAlign = attributes?.["vertical-align"];
  const columnStyle: React.CSSProperties = {
    flex: columnWidth ? `0 0 ${columnWidth}` : "1 1 0",
    maxWidth: columnWidth,
    width: columnWidth,
  };

  if (verticalAlign === "middle") {
    columnStyle.alignSelf = "center";
  } else if (verticalAlign === "bottom") {
    columnStyle.alignSelf = "flex-end";
  }

  return columnStyle;
};
