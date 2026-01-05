import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
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
import { Copy, GripHorizontal, Plus, Trash2 } from "lucide-react";
import { ReactNode } from "react";

import { getAllowedChildOptions } from "../../config/nodes";
import { selectDoc, useEmailDocStore } from "../../store";
import { TableSizePicker } from "../table/table-size-picker";

interface Props {
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  disabled?: boolean;
  droppableGap?: ReactNode;
  isSelected?: boolean;
}

export function DroppableContainer({
  className,
  id,
  items,
  disabled = false,
  children,
  droppableGap,
  isSelected = false,
  ...props
}: Props & Omit<React.ComponentProps<"div">, "id">) {
  const { isDragging, setNodeRef, transition, isOver, listeners } = useSortable(
    {
      id,
      data: {
        type: "container",
        children: items,
      },
      disabled,
    },
  );

  const duplicateComponent = useEmailDocStore((s) => s.duplicateComponent);
  const removeComponent = useEmailDocStore((s) => s.removeComponent);
  const appendChild = useEmailDocStore((s) => s.appendChild);
  const appendTableWithSize = useEmailDocStore((s) => s.appendTableWithSize);
  const data = useEmailDocStore(selectDoc);
  const node = data[id];
  const hasHeadChild =
    node?.tagName === "mjml" &&
    node.items.some((childId) => data[childId]?.tagName === "mj-head");
  const addOptions = node
    ? getAllowedChildOptions(node.tagName).filter((option) =>
        option.tagName === "mj-head" && hasHeadChild ? false : true,
      )
    : [];
  const canAddChildren = addOptions.length > 0;

  const displayTag = node?.tagName?.startsWith("mj-")
    ? node.tagName.slice(3)
    : node?.tagName;

  return (
    <div className="relative">
      {isSelected && (
        <div className="flex w-full justify-end ">
          <div className="flex p-1 bg-blue-500 text-background gap-2 absolute -translate-y-[100%]">
            {displayTag && (
              <span className="self-center px-1 text-[10px] font-semibold uppercase tracking-wide text-blue-50">
                {displayTag}
              </span>
            )}
            {canAddChildren && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Plus size={15} />
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateComponent(id);
              }}
            >
              <Copy size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeComponent(id);
              }}
            >
              <Trash2 size={15} />
            </button>
            <GripHorizontal size={15} {...listeners} />
          </div>
        </div>
      )}

      <div
        className={cn(
          className,
          isOver && `border border-blue-400`,
          isDragging && "opacity-40 pointer-events-none",
        )}
        ref={setNodeRef}
        style={{
          ...props.style,
          transition,
        }}
        {...props}
      >
        <div>{children}</div>
      </div>
      {droppableGap}
    </div>
  );
}
