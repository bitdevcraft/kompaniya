import type { UniqueIdentifier } from "@dnd-kit/core";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "@kompaniya/ui-common/components/button";
import { useState } from "react";

import { collisionDetection } from "../../lib/collission-detection";
import { useComponentStore } from "../../store/use-component-store";
import { TreeNode } from "./tree-node";

const ROOT_ID = "root-canvas" as UniqueIdentifier;
const ROOT_HEAD_ID = "root-head" as UniqueIdentifier;

export function TreeView() {
  const data = useComponentStore((s) => s.data);
  const moveComponent = useComponentStore((s) => s.moveComponent);
  const setDragActiveId = useComponentStore((s) => s.setDragActiveId);
  const [collapsedIds, setCollapsedIds] = useState<Set<UniqueIdentifier>>(
    new Set([ROOT_HEAD_ID]),
  );

  const toggleCollapse = (id: UniqueIdentifier) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const collapseAll = () => {
    setCollapsedIds(() => {
      const next = new Set<UniqueIdentifier>();
      Object.entries(data).forEach(([id, node]) => {
        if (node.items.length > 0 && id !== ROOT_ID) {
          next.add(id as UniqueIdentifier);
        }
      });
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDragActiveId(event.active.id);
  };

  const handleDragCancel = () => {
    setDragActiveId("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragActiveId("");
    const { over, active } = event;
    if (!over) return;

    const overId = String(over.id);
    if (!overId.startsWith("droppable|")) return;

    moveComponent(overId, active.id);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  if (!data[ROOT_ID]) return null;

  return (
    <div className="flex min-h-0 flex-col rounded-md border bg-background p-2">
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tree
        </p>
        <Button
          className="h-7 px-2 text-[11px]"
          onClick={collapseAll}
          size="sm"
          type="button"
          variant="ghost"
        >
          Collapse all
        </Button>
      </div>
      <DndContext
        collisionDetection={collisionDetection}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <TreeNode
          collapsedIds={collapsedIds}
          depth={0}
          id={ROOT_ID}
          onToggleCollapse={toggleCollapse}
        />
      </DndContext>
    </div>
  );
}
