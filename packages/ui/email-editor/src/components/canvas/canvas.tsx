"use client";

import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo } from "react";
import { createPortal } from "react-dom";

import type { ViewportMode } from "../../types/viewport";

import { collisionDetection } from "../../lib/collission-detection";
import { snapToLeftTopCorner } from "../../lib/drag-overlay-modifiers";
import { useComponentStore } from "../../store/use-component-store";
import { buildHeadAttributes } from "../../utils/head-attributes";
import { CanvasNode } from "./canvas-node";
import { DragPreviewNode } from "./drag-preview-node";

export function Canvas({
  viewportMode = "web",
}: {
  viewportMode?: ViewportMode;
}) {
  const moveComponent = useComponentStore((s) => s.moveComponent);
  const setDragActiveId = useComponentStore((s) => s.setDragActiveId);
  const dragActiveId = useComponentStore((s) => s.dragActiveId);
  const data = useComponentStore((s) => s.data);
  const headAttributes = useMemo(() => buildHeadAttributes(data), [data]);

  // const [dragActiveId, setDragActiveId] = useQueryState(
  //   "dragActiveId",
  //   parseAsUniqueIdentifier.withDefault("")
  // );

  const handleDragStart = (event: DragStartEvent) => {
    setDragActiveId(event.active.id);
  };
  const handleDragCancel = (_event: DragCancelEvent) => {
    setDragActiveId("");
  };

  const handleDragMove = (_event: DragMoveEvent) => {
    // console.log(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragActiveId("");

    const { over, active } = event;

    if (active.id === "root-canvas") return;
    if (!over) return;

    moveComponent(over.id, active.id);
  };
  const handleDragOver = (_event: DragOverEvent) => {
    //
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const isClient = () => typeof window !== "undefined";

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <CanvasNode
        dragActiveId={dragActiveId}
        headAttributes={headAttributes}
        id={"root-canvas"}
        viewportMode={viewportMode}
      />

      {isClient() &&
        createPortal(
          <DragOverlay
            adjustScale={false}
            className="grid"
            modifiers={[snapToLeftTopCorner]}
            wrapperElement={"div"}
          >
            {dragActiveId && (
              <div className="pointer-events-none select-none">
                <DragPreviewNode
                  headAttributes={headAttributes}
                  id={dragActiveId}
                  viewportMode={viewportMode}
                />
              </div>
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
