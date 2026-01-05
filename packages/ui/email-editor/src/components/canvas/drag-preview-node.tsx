import type { UniqueIdentifier } from "@dnd-kit/core";

import { cn } from "@kompaniya/ui-common/lib/utils";

import type { BuilderNodeTag } from "../../config/nodes";
import type { ViewportMode } from "../../types/viewport";

import { LEAF_NODE_TAGS } from "../../config/nodes";
import { selectDoc, useEmailDocStore } from "../../store";
import {
  HeadAttributesConfig,
  isDescendantOfTag,
  resolveNodeAttributes,
} from "../../utils/head-attributes";
import {
  getAlignItemsClass,
  getColumnStyle,
  getJustifyClass,
  parseCellSpacing,
} from "./canvas-node-utils";
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
  const data = useEmailDocStore(selectDoc);
  const node = data[id];

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
  const {
    containerStyles = {},
    contentStyles = {},
    innerStyles = {},
  } = getNodeStyles(node.tagName, attributes);
  const mergedContainerStyles: React.CSSProperties = {
    ...containerStyles,
    width: "100%",
  };

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
    return "100%";
  };

  const sectionContentWidth =
    node.tagName === "mj-section"
      ? attributes["content-width"]?.trim() ||
        resolveBodyWidth(node.parent ?? id)
      : "";
  const baseInnerStyles = isColumnRow
    ? ({ ...innerStyles, width: "100%" } as React.CSSProperties)
    : innerStyles;
  const sectionInnerStyles =
    node.tagName === "mj-section"
      ? ({
          ...baseInnerStyles,
          width: "100%",
          ...(sectionContentWidth
            ? { maxWidth: sectionContentWidth, margin: "0 auto" }
            : {}),
        } as React.CSSProperties)
      : baseInnerStyles;
  const tableParentAttributes =
    isTableRow && node.parent
      ? resolveNodeAttributes(node.parent, data, headAttributes)
      : null;
  const tableCellSpacing =
    (isTable
      ? attributes["cellspacing"]
      : tableParentAttributes?.cellspacing) ?? "";
  const tableGapValue = parseCellSpacing(tableCellSpacing);
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
  const socialJustifyClass = getJustifyClass(socialAlign);
  const socialAlignItemsClass = getAlignItemsClass(socialAlign);
  const socialInnerStyles = innerStyles;

  if (isLeafNode) {
    return (
      <div className="w-full" style={mergedContainerStyles}>
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
    <div className="w-full" style={mergedContainerStyles}>
      {isColumnRow ? (
        <div className="flex w-full items-stretch" style={sectionInnerStyles}>
          {renderableItems.map((childId) => {
            const columnAttributes = resolveNodeAttributes(
              childId,
              data,
              headAttributes,
            );
            const columnStyle = getColumnStyle(columnAttributes);

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
