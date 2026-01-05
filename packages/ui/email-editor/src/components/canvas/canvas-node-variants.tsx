/* eslint-disable @next/next/no-img-element */
import type { UniqueIdentifier } from "@dnd-kit/core";

import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@kompaniya/ui-common/components/button";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { DroppableGap } from "../droppable/droppable-gap";
import { getColumnStyle } from "./canvas-node-utils";

export type CanvasNodeChildComponent = (props: {
  id: UniqueIdentifier;
  parentId: UniqueIdentifier;
  className?: string;
  children?: React.ReactNode;
}) => JSX.Element;

type BaseRenderProps = {
  id: UniqueIdentifier;
  renderableItems: UniqueIdentifier[];
  canDropHere: boolean;
  ChildNode: CanvasNodeChildComponent;
};

type GetNodeAttributes = (id: UniqueIdentifier) => NodeAttributes;

type NodeAttributes = Record<string, string | undefined>;

export function CanvasNodeCarousel({
  id,
  canDropHere,
  carouselItems,
  carouselActiveIndex,
  attributes,
  carouselIconStyles,
  setActiveId,
  getNodeAttributes,
  ChildNode,
}: {
  id: UniqueIdentifier;
  canDropHere: boolean;
  carouselItems: UniqueIdentifier[];
  carouselActiveIndex: number;
  attributes: NodeAttributes;
  carouselIconStyles: React.CSSProperties;
  setActiveId: (id: UniqueIdentifier) => void;
  getNodeAttributes: GetNodeAttributes;
  ChildNode: CanvasNodeChildComponent;
}) {
  return (
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
                    <ChildNode id={childId} parentId={id} />
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
                    style={carouselIconStyles}
                  />
                ) : (
                  <ChevronLeft style={carouselIconStyles} />
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
                    style={carouselIconStyles}
                  />
                ) : (
                  <ChevronRight style={carouselIconStyles} />
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
              const imageAttributes = getNodeAttributes(childId);
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
  );
}

export function CanvasNodeColumnRow({
  id,
  renderableItems,
  canDropHere,
  sectionInnerStyles,
  getNodeAttributes,
  ChildNode,
}: BaseRenderProps & {
  sectionInnerStyles: React.CSSProperties;
  getNodeAttributes: GetNodeAttributes;
}) {
  return (
    <SortableContext
      items={renderableItems}
      strategy={horizontalListSortingStrategy}
    >
      <div className="flex w-full items-stretch" style={sectionInnerStyles}>
        <DroppableGap
          hidden={!canDropHere}
          id={id}
          index={0}
          isEnabled={canDropHere}
          orientation="horizontal"
        />
        {renderableItems.map((childId, idx) => {
          const columnStyle = getColumnStyle(getNodeAttributes(childId));
          return (
            <div className="flex min-w-0" key={childId} style={columnStyle}>
              <div className="min-w-0 flex-1">
                <ChildNode id={childId} parentId={id} />
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
  );
}

export function CanvasNodeDefault({
  id,
  renderableItems,
  canDropHere,
  sectionInnerStyles,
  ChildNode,
}: BaseRenderProps & {
  sectionInnerStyles: React.CSSProperties;
}) {
  return (
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
            <ChildNode id={childId} parentId={id}>
              <DroppableGap
                hidden={!canDropHere}
                id={id}
                index={idx + 1}
                isEnabled={canDropHere}
              />
            </ChildNode>
          </div>
        ))}
      </div>
    </SortableContext>
  );
}

export function CanvasNodeNavbar({
  id,
  renderableItems,
  canDropHere,
  navbarJustifyClass,
  innerStyles,
  ChildNode,
}: BaseRenderProps & {
  navbarJustifyClass: string;
  innerStyles: React.CSSProperties;
}) {
  return (
    <SortableContext
      items={renderableItems}
      strategy={horizontalListSortingStrategy}
    >
      <div className="w-full">
        <div
          className={cn("flex flex-wrap items-center", navbarJustifyClass)}
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
                <ChildNode className="w-auto" id={childId} parentId={id} />
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
  );
}

export function CanvasNodeSocial({
  id,
  renderableItems,
  canDropHere,
  isSocialHorizontal,
  socialJustifyClass,
  socialAlignItemsClass,
  socialInnerStyles,
  ChildNode,
}: BaseRenderProps & {
  isSocialHorizontal: boolean;
  socialJustifyClass: string;
  socialAlignItemsClass: string;
  socialInnerStyles: React.CSSProperties;
}) {
  return (
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
            isSocialHorizontal ? socialJustifyClass : socialAlignItemsClass,
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
                <ChildNode
                  className={isSocialHorizontal ? "w-auto" : "w-full"}
                  id={childId}
                  parentId={id}
                />
                <DroppableGap
                  hidden={!canDropHere}
                  id={id}
                  index={idx + 1}
                  isEnabled={canDropHere}
                  orientation={isSocialHorizontal ? "horizontal" : undefined}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </SortableContext>
  );
}

export function CanvasNodeTable({
  id,
  renderableItems,
  canDropHere,
  innerStyles,
  tableRowsStyles,
  isSelected,
  appendTableRow,
  appendTableColumn,
  ChildNode,
}: BaseRenderProps & {
  innerStyles: React.CSSProperties;
  tableRowsStyles: React.CSSProperties;
  isSelected: boolean;
  appendTableRow: (id: UniqueIdentifier) => void;
  appendTableColumn: (id: UniqueIdentifier) => void;
}) {
  return (
    <SortableContext
      items={renderableItems}
      strategy={verticalListSortingStrategy}
    >
      <div className="w-full">
        {isSelected && (
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
        <div className="w-full" style={{ ...innerStyles, ...tableRowsStyles }}>
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
              <ChildNode id={childId} parentId={id}>
                <DroppableGap
                  hidden={!canDropHere}
                  id={id}
                  index={idx + 1}
                  isEnabled={canDropHere}
                />
              </ChildNode>
            </div>
          ))}
        </div>
      </div>
    </SortableContext>
  );
}

export function CanvasNodeTableRow({
  id,
  renderableItems,
  canDropHere,
  rowFlexStyles,
  ChildNode,
}: BaseRenderProps & {
  rowFlexStyles: React.CSSProperties;
}) {
  return (
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
              <ChildNode id={childId} parentId={id} />
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
  );
}
