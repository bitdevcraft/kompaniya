import type { UniqueIdentifier } from "@dnd-kit/core";

import { cn } from "@kompaniya/ui-common/lib/utils";

import type { BuilderNodeTag } from "../../config/nodes";
import type { ViewportMode } from "../../types/viewport";

import { LEAF_NODE_TAGS } from "../../config/nodes";
import { useComponentStore } from "../../store/use-component-store";
import {
  HeadAttributesConfig,
  isDescendantOfTag,
  resolveNodeAttributes,
} from "../../utils/head-attributes";
import { getNodeStyles, renderLeafNode } from "./nodes";

const noop = (_id: UniqueIdentifier) => {};
const noopContent = (_id: UniqueIdentifier, _content: string) => {};
const noopInsert = (_id: UniqueIdentifier, _tagName: string) => null;

export function DragPreviewNode({
  id,
  viewportMode = "web",
  headAttributes,
}: {
  id: UniqueIdentifier;
  viewportMode?: ViewportMode;
  headAttributes?: HeadAttributesConfig;
}) {
  const node = useComponentStore((s) => s.data[id]);
  const data = useComponentStore((s) => s.data);

  if (!node) return null;
  if (isDescendantOfTag(id, data, "mj-head")) return null;

  const renderableItems = node.items.filter(
    (childId) => !isDescendantOfTag(childId, data, "mj-head"),
  );
  const isColumnRow =
    (node.tagName === "mj-section" || node.tagName === "mj-group") &&
    viewportMode !== "mobile" &&
    renderableItems.every((childId) => data[childId]?.tagName === "mj-column");
  const isTable = node.tagName === "mj-table";
  const isTableRow = node.tagName === "tr";
  const isSocial = node.tagName === "mj-social";
  const attributes = resolveNodeAttributes(id, data, headAttributes);
  const isLeafNode = LEAF_NODE_TAGS.has(node.tagName as BuilderNodeTag);
  const isFullWidthSection =
    node.tagName === "mj-section" &&
    (attributes["full-width"] === "full-width" ||
      attributes["full-width"] === "true");

  const {
    containerStyles = {},
    contentStyles = {},
    innerStyles = {},
  } = getNodeStyles(node.tagName, attributes);

  const resolveBodyWidth = (startId?: UniqueIdentifier) => {
    let currentId = startId;
    while (currentId) {
      const current = data[currentId];
      if (!current) break;
      if (current.tagName === "mj-body") {
        const bodyAttributes = resolveNodeAttributes(
          currentId,
          data,
          headAttributes,
        );
        return bodyAttributes?.width ?? "600px";
      }
      currentId = current.parent as UniqueIdentifier | undefined;
    }
    return "600px";
  };

  const sectionInnerStyles = isColumnRow
    ? ({
        ...innerStyles,
        width: "100%",
        ...(isFullWidthSection
          ? { maxWidth: "100%" }
          : node.tagName === "mj-section"
            ? {
                maxWidth: resolveBodyWidth(node.parent ?? id),
                margin: "0 auto",
              }
            : {}),
      } as React.CSSProperties)
    : innerStyles;
  const tableParentAttributes =
    isTableRow && node.parent
      ? resolveNodeAttributes(node.parent, data, headAttributes)
      : null;
  const tableCellSpacing =
    (isTable
      ? attributes["cellspacing"]
      : tableParentAttributes?.cellspacing) ?? "";
  const tableGapValue = (() => {
    const trimmed = tableCellSpacing.trim();
    if (!trimmed) return undefined;
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) && trimmed === String(numeric)
      ? numeric
      : trimmed;
  })();
  const rowFlexStyles: React.CSSProperties = isTableRow
    ? { display: "flex", gap: tableGapValue }
    : {};
  const tableRowsStyles: React.CSSProperties = isTable
    ? {
        display: "flex",
        flexDirection: "column",
        gap: tableGapValue,
      }
    : {};
  const socialMode = attributes["mode"] ?? "horizontal";
  const isSocialHorizontal = socialMode !== "vertical";
  const socialAlign = attributes["align"];
  const socialJustifyClass =
    socialAlign === "center"
      ? "justify-center"
      : socialAlign === "right"
        ? "justify-end"
        : "justify-start";
  const socialAlignItemsClass =
    socialAlign === "center"
      ? "items-center"
      : socialAlign === "right"
        ? "items-end"
        : "items-start";
  const socialInnerStyles = innerStyles;

  if (isLeafNode) {
    return (
      <div className="w-full" style={containerStyles}>
        {renderLeafNode(node.tagName, {
          id,
          node,
          attributes,
          contentStyles,
          isActive: false,
          setActiveId: noop,
          setNodeContent: noopContent,
          insertSiblingAfter: noopInsert,
        })}
      </div>
    );
  }

  return (
    <div className="w-full" style={containerStyles}>
      {isColumnRow ? (
        <div className="flex w-full items-stretch" style={sectionInnerStyles}>
          {renderableItems.map((childId) => {
            const columnAttributes = resolveNodeAttributes(
              childId,
              data,
              headAttributes,
            );
            const columnWidth = columnAttributes?.width;
            const verticalAlign = columnAttributes?.["vertical-align"];
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

            return (
              <div className="flex min-w-0" key={childId} style={columnStyle}>
                <div className="min-w-0 flex-1">
                  <DragPreviewNode
                    headAttributes={headAttributes}
                    id={childId}
                    viewportMode={viewportMode}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : isTable ? (
        <div className="w-full" style={{ ...innerStyles, ...tableRowsStyles }}>
          {renderableItems.map((childId) => (
            <DragPreviewNode
              headAttributes={headAttributes}
              id={childId}
              key={childId}
              viewportMode={viewportMode}
            />
          ))}
        </div>
      ) : isTableRow ? (
        <div className="w-full" style={rowFlexStyles}>
          {renderableItems.map((childId) => (
            <div className="flex min-w-0 flex-1" key={childId}>
              <DragPreviewNode
                headAttributes={headAttributes}
                id={childId}
                viewportMode={viewportMode}
              />
            </div>
          ))}
        </div>
      ) : isSocial ? (
        <div className="w-full">
          <div
            className={cn(
              "flex w-full",
              isSocialHorizontal ? "flex-wrap items-center" : "flex-col",
              isSocialHorizontal ? socialJustifyClass : socialAlignItemsClass,
            )}
            style={socialInnerStyles}
          >
            {renderableItems.map((childId) => (
              <div
                className={cn(
                  "flex min-w-0",
                  isSocialHorizontal ? "w-auto" : "w-full",
                )}
                key={childId}
              >
                <DragPreviewNode
                  headAttributes={headAttributes}
                  id={childId}
                  viewportMode={viewportMode}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full" style={sectionInnerStyles}>
          {renderableItems.map((childId) => (
            <DragPreviewNode
              headAttributes={headAttributes}
              id={childId}
              key={childId}
              viewportMode={viewportMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
