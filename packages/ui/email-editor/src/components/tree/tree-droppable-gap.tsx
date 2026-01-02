import type { UniqueIdentifier } from "@dnd-kit/core";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@kompaniya/ui-common/lib/utils";

export function TreeDroppableGap({
  parentId,
  index,
  depth,
  isEnabled = false,
}: {
  parentId: UniqueIdentifier;
  index: number;
  depth: number;
  isEnabled?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable|${parentId}|${index}`,
    disabled: !isEnabled,
  });

  return (
    <div
      className={cn(
        "h-2 rounded-sm transition-colors",
        isEnabled
          ? isOver
            ? "bg-blue-300"
            : "bg-blue-100/70"
          : "bg-transparent",
      )}
      ref={setNodeRef}
      style={{ marginLeft: depth * 12 }}
    />
  );
}
