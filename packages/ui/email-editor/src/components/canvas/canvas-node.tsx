/* eslint-disable @next/next/no-img-element */
/* cspell:ignore renderable */
import type { UniqueIdentifier } from "@dnd-kit/core";

import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@kompaniya/ui-common/components/button";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { BuilderNodeTag } from "../../config/nodes";
import type { ViewportMode } from "../../types/viewport";

import { canAcceptChildTag, LEAF_NODE_TAGS } from "../../config/nodes";
import { useComponentStore } from "../../store/use-component-store";
import {
  HeadAttributesConfig,
  isDescendantOfTag,
  resolveNodeAttributes,
} from "../../utils/head-attributes";
import { DroppableContainer } from "../droppable/droppable-container";
import { DroppableGap } from "../droppable/droppable-gap";
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
  const node = useComponentStore((s) => s.data[id]);
  const data = useComponentStore((s) => s.data);
  const activeId = useComponentStore((s) => s.activeId);
  const setActiveId = useComponentStore((s) => s.setActiveId);
  const hoverActiveId = useComponentStore((s) => s.hoverActiveId);
  const setHoverActiveId = useComponentStore((s) => s.setHoverActiveId);
  const setNodeContent = useComponentStore((s) => s.setNodeContent);
  const insertSiblingAfter = useComponentStore((s) => s.insertSiblingAfter);
  const appendTableRow = useComponentStore((s) => s.appendTableRow);
  const appendTableColumn = useComponentStore((s) => s.appendTableColumn);

  if (!node) return null;
  if (isDescendantOfTag(id, data, "mj-head")) return null;

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
  const isFullWidthSection =
    node.tagName === "mj-section" &&
    (attributes["full-width"] === "full-width" ||
      attributes["full-width"] === "true");
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

  const mergedStyle = {
    ...containerStyles,
    ...(props.style ?? {}),
  } as React.CSSProperties;

  const leafContent = renderLeafNode(node.tagName, {
    id,
    node,
    attributes,
    contentStyles,
    isActive: activeId === id,
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
  const navbarJustifyClass =
    navbarAlign === "center"
      ? "justify-center"
      : navbarAlign === "right"
        ? "justify-end"
        : "justify-start";
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

  return (
    <>
      <DroppableContainer
        className={cn(
          "w-full border border-transparent transition-shadow",
          emptyContainerClass,
          activeId === id && "border-blue-400 ring-1 ring-blue-400/30",
          hoverActiveId === id &&
            activeId !== id &&
            "shadow-lg border-muted-foreground/70 ring-1 ring-blue-200/30",
          className,
        )}
        disabled={dropDisable}
        droppableGap={children}
        id={id}
        isSelected={activeId === id}
        items={renderableItems}
        style={mergedStyle}
        {...props}
        onClick={(e) => {
          e.stopPropagation();
          setActiveId(id);
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          setHoverActiveId(id);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          setHoverActiveId("");
        }}
      >
        {isLeafNode && leafContent}
        {!isLeafNode &&
          (isCarousel ? (
            <SortableContext
              items={carouselItems}
              strategy={horizontalListSortingStrategy}
            >
              <div className="w-full">
                <div
                  className="relative w-full overflow-hidden"
                  style={{
                    borderRadius: attributes["border-radius"],
                    height: attributes["height"],
                  }}
                >
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(-${carouselActiveIndex * 100}%)`,
                    }}
                  >
                    <DroppableGap
                      hidden={!canDropHere}
                      id={id}
                      index={0}
                      isEnabled={canDropHere}
                      orientation="horizontal"
                    />
                    {carouselItems.length === 0 ? (
                      <div className="flex min-h-[120px] w-full items-center justify-center text-xs text-muted-foreground">
                        Add carousel images
                      </div>
                    ) : (
                      carouselItems.map((childId, idx) => (
                        <div
                          className="flex min-w-0 flex-[0_0_100%]"
                          key={childId}
                          style={{
                            height: attributes["height"],
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <CanvasNode
                              dragActiveId={dragActiveId}
                              dropDisable={dropDisable || id === dragActiveId}
                              headAttributes={headAttributes}
                              id={childId}
                              parentId={id}
                              viewportMode={viewportMode}
                            />
                          </div>
                          <DroppableGap
                            hidden={!canDropHere}
                            id={id}
                            index={idx + 1}
                            isEnabled={canDropHere}
                            orientation="horizontal"
                          />
                        </div>
                      ))
                    )}
                  </div>
                  {carouselItems.length > 1 && (
                    <>
                      <button
                        aria-label="Previous slide"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-1 shadow-sm ring-1 ring-muted-foreground/30"
                        onClick={(event) => {
                          event.stopPropagation();
                          const nextIndex =
                            carouselActiveIndex === 0
                              ? carouselItems.length - 1
                              : carouselActiveIndex - 1;
                          const nextId = carouselItems[nextIndex];
                          if (nextId) {
                            setActiveId(nextId);
                          }
                        }}
                        type="button"
                      >
                        {attributes["left-icon"] ? (
                          <img
                            alt="Previous"
                            src={attributes["left-icon"]}
                            style={{
                              width: attributes["icon-width"] ?? "18px",
                              height: attributes["icon-height"] ?? "18px",
                            }}
                          />
                        ) : (
                          <ChevronLeft
                            style={{
                              width: attributes["icon-width"] ?? "18px",
                              height: attributes["icon-height"] ?? "18px",
                            }}
                          />
                        )}
                      </button>
                      <button
                        aria-label="Next slide"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-1 shadow-sm ring-1 ring-muted-foreground/30"
                        onClick={(event) => {
                          event.stopPropagation();
                          const nextIndex =
                            carouselActiveIndex === carouselItems.length - 1
                              ? 0
                              : carouselActiveIndex + 1;
                          const nextId = carouselItems[nextIndex];
                          if (nextId) {
                            setActiveId(nextId);
                          }
                        }}
                        type="button"
                      >
                        {attributes["right-icon"] ? (
                          <img
                            alt="Next"
                            src={attributes["right-icon"]}
                            style={{
                              width: attributes["icon-width"] ?? "18px",
                              height: attributes["icon-height"] ?? "18px",
                            }}
                          />
                        ) : (
                          <ChevronRight
                            style={{
                              width: attributes["icon-width"] ?? "18px",
                              height: attributes["icon-height"] ?? "18px",
                            }}
                          />
                        )}
                      </button>
                    </>
                  )}
                </div>
                {carouselItems.length > 1 && (
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-2",
                      attributes["align"] === "left" && "justify-start",
                      attributes["align"] === "right" && "justify-end",
                      attributes["align"] !== "left" &&
                        attributes["align"] !== "right" &&
                        "justify-center",
                    )}
                  >
                    {carouselItems.map((childId, index) => {
                      const imageAttributes = resolveNodeAttributes(
                        childId,
                        data,
                        headAttributes,
                      );
                      const imageSrc = imageAttributes?.src;
                      const isActive = index === carouselActiveIndex;
                      return (
                        <button
                          aria-label={`Go to slide ${index + 1}`}
                          className={cn(
                            "relative h-10 w-14 overflow-hidden rounded border",
                            isActive
                              ? "border-blue-500 ring-1 ring-blue-400"
                              : "border-muted-foreground/30",
                          )}
                          key={childId}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveId(childId);
                          }}
                          type="button"
                        >
                          {imageSrc ? (
                            <img
                              alt={imageAttributes?.alt ?? "Thumbnail"}
                              className="h-full w-full object-cover"
                              src={imageSrc}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              Image
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </SortableContext>
          ) : isNavbar ? (
            <SortableContext
              items={renderableItems}
              strategy={horizontalListSortingStrategy}
            >
              <div className="w-full">
                <div
                  className={cn(
                    "flex flex-wrap items-center",
                    navbarJustifyClass,
                  )}
                  style={innerStyles}
                >
                  <DroppableGap
                    hidden={!canDropHere}
                    id={id}
                    index={0}
                    isEnabled={canDropHere}
                    orientation="horizontal"
                  />
                  {renderableItems.length === 0 ? (
                    <div className="flex min-h-10 w-full items-center justify-center text-xs text-muted-foreground">
                      Add navbar links
                    </div>
                  ) : (
                    renderableItems.map((childId, idx) => (
                      <div className="flex min-w-0" key={childId}>
                        <CanvasNode
                          className="w-auto"
                          dragActiveId={dragActiveId}
                          dropDisable={dropDisable || id === dragActiveId}
                          headAttributes={headAttributes}
                          id={childId}
                          parentId={id}
                          viewportMode={viewportMode}
                        />
                        <DroppableGap
                          hidden={!canDropHere}
                          id={id}
                          index={idx + 1}
                          isEnabled={canDropHere}
                          orientation="horizontal"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SortableContext>
          ) : isSocial ? (
            <SortableContext
              items={renderableItems}
              strategy={
                isSocialHorizontal
                  ? horizontalListSortingStrategy
                  : verticalListSortingStrategy
              }
            >
              <div className="w-full">
                <div
                  className={cn(
                    "flex w-full",
                    isSocialHorizontal ? "flex-wrap items-center" : "flex-col",
                    isSocialHorizontal
                      ? socialJustifyClass
                      : socialAlignItemsClass,
                  )}
                  style={socialInnerStyles}
                >
                  <DroppableGap
                    hidden={!canDropHere}
                    id={id}
                    index={0}
                    isEnabled={canDropHere}
                    orientation={isSocialHorizontal ? "horizontal" : undefined}
                  />
                  {renderableItems.length === 0 ? (
                    <div className="flex min-h-10 w-full items-center justify-center text-xs text-muted-foreground">
                      Add social links
                    </div>
                  ) : (
                    renderableItems.map((childId, idx) => (
                      <div
                        className={cn(
                          "flex min-w-0",
                          isSocialHorizontal ? "w-auto" : "w-full",
                        )}
                        key={childId}
                      >
                        <CanvasNode
                          className={isSocialHorizontal ? "w-auto" : "w-full"}
                          dragActiveId={dragActiveId}
                          dropDisable={dropDisable || id === dragActiveId}
                          headAttributes={headAttributes}
                          id={childId}
                          parentId={id}
                          viewportMode={viewportMode}
                        />
                        <DroppableGap
                          hidden={!canDropHere}
                          id={id}
                          index={idx + 1}
                          isEnabled={canDropHere}
                          orientation={
                            isSocialHorizontal ? "horizontal" : undefined
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </SortableContext>
          ) : isTable ? (
            <SortableContext
              items={renderableItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="w-full">
                {activeId === id && (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        appendTableRow(id);
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Add row
                    </Button>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        appendTableColumn(id);
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Add column
                    </Button>
                  </div>
                )}
                <div
                  className="w-full"
                  style={{ ...innerStyles, ...tableRowsStyles }}
                >
                  {renderableItems.map((childId, idx) => (
                    <div key={childId}>
                      {idx === 0 ? (
                        <DroppableGap
                          hidden={!canDropHere}
                          id={id}
                          index={idx}
                          isEnabled={canDropHere}
                        />
                      ) : (
                        <></>
                      )}
                      <CanvasNode
                        dragActiveId={dragActiveId}
                        dropDisable={dropDisable || id === dragActiveId}
                        headAttributes={headAttributes}
                        id={childId}
                        parentId={id}
                        viewportMode={viewportMode}
                      >
                        <DroppableGap
                          hidden={!canDropHere}
                          id={id}
                          index={idx + 1}
                          isEnabled={canDropHere}
                        />
                      </CanvasNode>
                    </div>
                  ))}
                </div>
              </div>
            </SortableContext>
          ) : isTableRow ? (
            <SortableContext
              items={renderableItems}
              strategy={horizontalListSortingStrategy}
            >
              <div className="w-full" style={rowFlexStyles}>
                <DroppableGap
                  hidden={!canDropHere}
                  id={id}
                  index={0}
                  isEnabled={canDropHere}
                  orientation="horizontal"
                />
                {renderableItems.length === 0 ? (
                  <div className="flex min-h-8 w-full items-center justify-center text-xs text-muted-foreground">
                    Add table cells
                  </div>
                ) : (
                  renderableItems.map((childId, idx) => (
                    <div className="flex min-w-0 flex-1" key={childId}>
                      <CanvasNode
                        dragActiveId={dragActiveId}
                        dropDisable={dropDisable || id === dragActiveId}
                        headAttributes={headAttributes}
                        id={childId}
                        parentId={id}
                        viewportMode={viewportMode}
                      />
                      <DroppableGap
                        hidden={!canDropHere}
                        id={id}
                        index={idx + 1}
                        isEnabled={canDropHere}
                        orientation="horizontal"
                      />
                    </div>
                  ))
                )}
              </div>
            </SortableContext>
          ) : isColumnRow ? (
            <SortableContext
              items={renderableItems}
              strategy={horizontalListSortingStrategy}
            >
              <div
                className="flex w-full items-stretch"
                style={sectionInnerStyles}
              >
                <DroppableGap
                  hidden={!canDropHere}
                  id={id}
                  index={0}
                  isEnabled={canDropHere}
                  orientation="horizontal"
                />
                {renderableItems.map((childId, idx) => {
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
                    <div
                      className="flex min-w-0"
                      key={childId}
                      style={columnStyle}
                    >
                      <div className="min-w-0 flex-1">
                        <CanvasNode
                          dragActiveId={dragActiveId}
                          dropDisable={dropDisable || id === dragActiveId}
                          headAttributes={headAttributes}
                          id={childId}
                          parentId={id}
                          viewportMode={viewportMode}
                        />
                      </div>
                      <DroppableGap
                        hidden={!canDropHere}
                        id={id}
                        index={idx + 1}
                        isEnabled={canDropHere}
                        orientation="horizontal"
                      />
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          ) : (
            <SortableContext
              items={renderableItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="w-full" style={sectionInnerStyles}>
                {renderableItems.map((childId, idx) => (
                  <div key={childId}>
                    {idx === 0 ? (
                      <DroppableGap
                        hidden={!canDropHere}
                        id={id}
                        index={idx}
                        isEnabled={canDropHere}
                      />
                    ) : (
                      <></>
                    )}
                    <CanvasNode
                      dragActiveId={dragActiveId}
                      dropDisable={dropDisable || id === dragActiveId}
                      headAttributes={headAttributes}
                      id={childId}
                      parentId={id}
                      viewportMode={viewportMode}
                    >
                      <DroppableGap
                        hidden={!canDropHere}
                        id={id}
                        index={idx + 1}
                        isEnabled={canDropHere}
                      />
                    </CanvasNode>
                  </div>
                ))}
              </div>
            </SortableContext>
          ))}
      </DroppableContainer>
    </>
  );
}
