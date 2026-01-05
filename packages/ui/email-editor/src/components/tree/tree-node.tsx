import type { UniqueIdentifier } from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@kompaniya/ui-common/components/dropdown-menu";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react";

import type { BuilderNodeTag } from "../../config/nodes";

import {
  canAcceptChildTag,
  getAllowedChildOptions,
  LEAF_NODE_TAGS,
} from "../../config/nodes";
import { selectDoc, useEmailDocStore, useEmailUIStore } from "../../store";
import { TableSizePicker } from "../table/table-size-picker";
import { TreeDroppableGap } from "./tree-droppable-gap";

const ROOT_ID = "root-canvas" as UniqueIdentifier;
const ROOT_BODY_ID = "root-body" as UniqueIdentifier;
const ROOT_HEAD_ID = "root-head" as UniqueIdentifier;

export function TreeNode({
  id,
  depth,
  collapsedIds,
  onToggleCollapse,
}: {
  id: UniqueIdentifier;
  depth: number;
  collapsedIds: Set<UniqueIdentifier>;
  onToggleCollapse: (id: UniqueIdentifier) => void;
}) {
  const data = useEmailDocStore(selectDoc);
  const node = data[id];
  const activeId = useEmailUIStore((state) => state.activeId);
  const dragActiveId = useEmailUIStore((state) => state.dragActiveId);
  const setActiveId = useEmailUIStore((state) => state.setActiveId);
  const appendChild = useEmailDocStore((s) => s.appendChild);
  const appendTableWithSize = useEmailDocStore((s) => s.appendTableWithSize);

  const isRoot = id === ROOT_ID || id === ROOT_BODY_ID || id === ROOT_HEAD_ID;
  const displayTag = node?.tagName?.startsWith("mj-")
    ? node.tagName.slice(3)
    : node?.tagName;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isRoot,
  });

  if (!node) return null;

  const isDragActive = Boolean(dragActiveId);
  const suppressTransform = isDragActive && dragActiveId !== id;
  const style = {
    transform: suppressTransform
      ? undefined
      : CSS.Transform.toString(transform),
    transition: suppressTransform ? undefined : transition,
    paddingLeft: depth * 12,
  } as React.CSSProperties;
  const dragNodeTag = dragActiveId ? data[dragActiveId]?.tagName : undefined;
  const canDropHere =
    isDragActive && dragNodeTag
      ? canAcceptChildTag(node.tagName, dragNodeTag)
      : false;

  const isLeaf = LEAF_NODE_TAGS.has(node.tagName as BuilderNodeTag);
  const hasHeadChild =
    id === ROOT_ID &&
    node.items.some((childId) => data[childId]?.tagName === "mj-head");
  const addOptions = getAllowedChildOptions(node.tagName).filter((option) =>
    option.tagName === "mj-head" && hasHeadChild ? false : true,
  );
  const canAddChildren = addOptions.length > 0;
  const hasChildren = !isLeaf && node.items.length > 0;
  const isCollapsed = hasChildren && collapsedIds.has(id);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 text-xs",
          activeId === id && "bg-blue-50 text-blue-700",
          isDragging && "opacity-60",
        )}
        onClick={(event) => {
          event.stopPropagation();
          setActiveId(id);
        }}
        ref={setNodeRef}
        style={style}
      >
        {hasChildren ? (
          <button
            aria-label={isCollapsed ? "Expand node" : "Collapse node"}
            className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollapse(id);
            }}
            type="button"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        ) : (
          <span aria-hidden className="flex size-5" />
        )}
        <span
          className={cn(
            "flex-1 text-[11px] font-semibold uppercase tracking-wide",
            isRoot && "text-muted-foreground",
          )}
        >
          {displayTag}
        </span>
        {!isLeaf && canAddChildren && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
                type="button"
              >
                <Plus size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {addOptions.map((option) =>
                option.tagName === "mj-table" ? (
                  <DropdownMenuSub key={option.tagName}>
                    <DropdownMenuSubTrigger className="gap-2">
                      {option.label}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      <TableSizePicker
                        onSelect={(rows, cols) => {
                          appendTableWithSize(id, rows, cols);
                        }}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    key={option.tagName}
                    onSelect={(event) => {
                      event.stopPropagation();
                      appendChild(id, option.tagName);
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded border text-muted-foreground",
            isRoot && "opacity-40",
          )}
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical size={12} />
        </span>
      </div>
      {!isLeaf && !isCollapsed && (
        <div className="flex flex-col gap-1">
          <TreeDroppableGap
            depth={depth + 1}
            index={0}
            isEnabled={canDropHere}
            parentId={id}
          />
          <SortableContext
            items={node.items}
            strategy={verticalListSortingStrategy}
          >
            {node.items.map((childId, index) => (
              <div key={childId}>
                <TreeNode
                  collapsedIds={collapsedIds}
                  depth={depth + 1}
                  id={childId}
                  onToggleCollapse={onToggleCollapse}
                />
                <TreeDroppableGap
                  depth={depth + 1}
                  index={index + 1}
                  isEnabled={canDropHere}
                  parentId={id}
                />
              </div>
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
