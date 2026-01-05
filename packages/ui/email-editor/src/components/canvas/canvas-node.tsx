/* cspell:ignore renderable */
import type { UniqueIdentifier } from "@dnd-kit/core";

import { cn } from "@kompaniya/ui-common/lib/utils";

import type { BuilderNodeTag } from "../../config/nodes";
import type { ViewportMode } from "../../types/viewport";

import { canAcceptChildTag, LEAF_NODE_TAGS } from "../../config/nodes";
import { selectDoc, useEmailDocStore, useEmailUIStore } from "../../store";
import {
  HeadAttributesConfig,
  isDescendantOfTag,
  resolveNodeAttributes,
} from "../../utils/head-attributes";
import { DroppableContainer } from "../droppable/droppable-container";
import {
  getAlignItemsClass,
  getJustifyClass,
  parseCellSpacing,
} from "./canvas-node-utils";
import {
  CanvasNodeCarousel,
  type CanvasNodeChildComponent,
  CanvasNodeColumnRow,
  CanvasNodeDefault,
  CanvasNodeNavbar,
  CanvasNodeSocial,
  CanvasNodeTable,
  CanvasNodeTableRow,
} from "./canvas-node-variants";
import { getNodeStyles, renderLeafNode } from "./nodes";

export function CanvasNode({
  id,
  dragActiveId,
  dropDisable = false,
  children,
  parentId,
  className,
  viewportMode = "web",
  headAttributes,
  ...props
}: {
  id: UniqueIdentifier;
  dragActiveId?: UniqueIdentifier;
  parentId?: UniqueIdentifier;
  dropDisable?: boolean;
  viewportMode?: ViewportMode;
  headAttributes?: HeadAttributesConfig;
} & Omit<React.ComponentProps<"div">, "id">) {
  const data = useEmailDocStore(selectDoc);
  const node = data[id];
  const activeId = useEmailUIStore((state) => state.activeId);
  const hoverActiveId = useEmailUIStore((state) => state.hoverActiveId);
  const setActiveId = useEmailUIStore((state) => state.setActiveId);
  const setHoverActiveId = useEmailUIStore((state) => state.setHoverActiveId);
  const setNodeContent = useEmailDocStore((s) => s.setNodeContent);
  const insertSiblingAfter = useEmailDocStore((s) => s.insertSiblingAfter);
  const appendTableRow = useEmailDocStore((s) => s.appendTableRow);
  const appendTableColumn = useEmailDocStore((s) => s.appendTableColumn);

  if (!node) return null;
  if (isDescendantOfTag(id, data, "mj-head")) return null;

  const isSelected = activeId === id;
  const isHovered = hoverActiveId === id;
  const isSelfDragging = id === dragActiveId;
  const childDropDisabled = dropDisable || isSelfDragging;

  const renderableItems = node.items.filter(
    (childId) => !isDescendantOfTag(childId, data, "mj-head"),
  );
  const isColumnRow =
    (node.tagName === "mj-section" || node.tagName === "mj-group") &&
    viewportMode !== "mobile" &&
    renderableItems.every((childId) => data[childId]?.tagName === "mj-column");
  const attributes = resolveNodeAttributes(id, data, headAttributes);
  const isLeafNode = LEAF_NODE_TAGS.has(node.tagName as BuilderNodeTag);
  const isEmptyContainer = !isLeafNode && renderableItems.length === 0;
  const dragNodeTag = dragActiveId ? data[dragActiveId]?.tagName : undefined;
  const canDropHere =
    Boolean(dragActiveId) && !dropDisable && dragNodeTag
      ? canAcceptChildTag(node.tagName, dragNodeTag)
      : false;
  const isCarousel = node.tagName === "mj-carousel";
  const isTable = node.tagName === "mj-table";
  const isTableRow = node.tagName === "tr";
  const isNavbar = node.tagName === "mj-navbar";
  const isSocial = node.tagName === "mj-social";
  const emptyContainerClass = isEmptyContainer
    ? node.tagName === "mj-body"
      ? "min-h-[160px]"
      : "min-h-10"
    : "";

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

  const mergedStyle = {
    ...containerStyles,
    ...(props.style ?? {}),
    width: "100%",
  } as React.CSSProperties;

  const commonChildProps = {
    dragActiveId,
    dropDisable: childDropDisabled,
    headAttributes,
    viewportMode,
  };

  const leafContent = renderLeafNode(node.tagName, {
    id,
    node,
    attributes,
    contentStyles,
    isActive: isSelected,
    setActiveId,
    setNodeContent,
    insertSiblingAfter,
  });
  const carouselItems = isCarousel ? renderableItems : [];
  const carouselActiveIndex = isCarousel
    ? Math.max(
        0,
        carouselItems.findIndex((childId) => childId === activeId),
      )
    : 0;
  const navbarAlign = attributes["align"];
  const navbarJustifyClass = getJustifyClass(navbarAlign);
  const socialMode = attributes["mode"] ?? "horizontal";
  const isSocialHorizontal = socialMode !== "vertical";
  const socialAlign = attributes["align"];
  const socialJustifyClass = getJustifyClass(socialAlign);
  const socialAlignItemsClass = getAlignItemsClass(socialAlign);
  const socialInnerStyles = innerStyles;
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
    ? {
        display: "flex",
        gap: tableGapValue,
      }
    : {};
  const tableRowsStyles: React.CSSProperties = isTable
    ? {
        display: "flex",
        flexDirection: "column",
        gap: tableGapValue,
      }
    : {};
  const carouselIconStyles: React.CSSProperties = {
    width: attributes["icon-width"] ?? "18px",
    height: attributes["icon-height"] ?? "18px",
  };

  const handleSelect = (event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveId(id);
  };
  const handleHoverStart = (event: React.MouseEvent) => {
    event.stopPropagation();
    setHoverActiveId(id);
  };
  const handleHoverEnd = (event: React.MouseEvent) => {
    event.stopPropagation();
    setHoverActiveId("");
  };

  const getNodeAttributes = (nodeId: UniqueIdentifier) =>
    resolveNodeAttributes(nodeId, data, headAttributes);

  /* eslint-disable react/prop-types */
  const ChildNode: CanvasNodeChildComponent = ({
    id: childId,
    parentId: childParentId,
    className: childClassName,
    children: childChildren,
  }) => (
    <CanvasNode
      className={childClassName}
      id={childId}
      parentId={childParentId}
      {...commonChildProps}
    >
      {childChildren}
    </CanvasNode>
  );
  /* eslint-enable react/prop-types */

  let content: React.ReactNode = null;
  if (isLeafNode) {
    content = leafContent;
  } else if (isCarousel) {
    content = (
      <CanvasNodeCarousel
        attributes={attributes}
        canDropHere={canDropHere}
        carouselActiveIndex={carouselActiveIndex}
        carouselIconStyles={carouselIconStyles}
        carouselItems={carouselItems}
        ChildNode={ChildNode}
        getNodeAttributes={getNodeAttributes}
        id={id}
        setActiveId={setActiveId}
      />
    );
  } else if (isNavbar) {
    content = (
      <CanvasNodeNavbar
        canDropHere={canDropHere}
        ChildNode={ChildNode}
        id={id}
        innerStyles={innerStyles}
        navbarJustifyClass={navbarJustifyClass}
        renderableItems={renderableItems}
      />
    );
  } else if (isSocial) {
    content = (
      <CanvasNodeSocial
        canDropHere={canDropHere}
        ChildNode={ChildNode}
        id={id}
        isSocialHorizontal={isSocialHorizontal}
        renderableItems={renderableItems}
        socialAlignItemsClass={socialAlignItemsClass}
        socialInnerStyles={socialInnerStyles}
        socialJustifyClass={socialJustifyClass}
      />
    );
  } else if (isTable) {
    content = (
      <CanvasNodeTable
        appendTableColumn={appendTableColumn}
        appendTableRow={appendTableRow}
        canDropHere={canDropHere}
        ChildNode={ChildNode}
        id={id}
        innerStyles={innerStyles}
        isSelected={isSelected}
        renderableItems={renderableItems}
        tableRowsStyles={tableRowsStyles}
      />
    );
  } else if (isTableRow) {
    content = (
      <CanvasNodeTableRow
        canDropHere={canDropHere}
        ChildNode={ChildNode}
        id={id}
        renderableItems={renderableItems}
        rowFlexStyles={rowFlexStyles}
      />
    );
  } else if (isColumnRow) {
    content = (
      <CanvasNodeColumnRow
        canDropHere={canDropHere}
        ChildNode={ChildNode}
        getNodeAttributes={getNodeAttributes}
        id={id}
        renderableItems={renderableItems}
        sectionInnerStyles={sectionInnerStyles}
      />
    );
  } else {
    content = (
      <CanvasNodeDefault
        canDropHere={canDropHere}
        ChildNode={ChildNode}
        id={id}
        renderableItems={renderableItems}
        sectionInnerStyles={sectionInnerStyles}
      />
    );
  }

  return (
    <>
      <DroppableContainer
        className={cn(
          "w-full border border-transparent transition-shadow",
          emptyContainerClass,
          isSelected && "border-blue-400 ring-1 ring-blue-400/30",
          isHovered &&
            !isSelected &&
            "shadow-lg border-muted-foreground/70 ring-1 ring-blue-200/30",
          className,
        )}
        disabled={dropDisable}
        droppableGap={children}
        id={id}
        isSelected={isSelected}
        items={renderableItems}
        style={mergedStyle}
        {...props}
        onClick={handleSelect}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
      >
        {content}
      </DroppableContainer>
    </>
  );
}
