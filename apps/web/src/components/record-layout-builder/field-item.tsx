"use client";

import { useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { GripVertical, X } from "lucide-react";

import type { RecordLayoutField } from "@/components/record-page/layout";
import type { NativeFieldDefinition } from "@/lib/field-definitions";

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: "bg-blue-100 text-blue-800",
  textarea: "bg-blue-100 text-blue-800",
  number: "bg-green-100 text-green-800",
  date: "bg-purple-100 text-purple-800",
  datetime: "bg-purple-100 text-purple-800",
  boolean: "bg-yellow-100 text-yellow-800",
  picklist: "bg-indigo-100 text-indigo-800",
  multipicklist: "bg-indigo-100 text-indigo-800",
  tag: "bg-pink-100 text-pink-800",
  phone: "bg-cyan-100 text-cyan-800",
  email: "bg-cyan-100 text-cyan-800",
  lookup: "bg-orange-100 text-orange-800",
};

export interface FieldItemProps {
  field: RecordLayoutField | NativeFieldDefinition;
  index: number;
  onRemove: () => void;
  sectionId: string;
  columnKey: "header" | "firstColumn" | "secondColumn";
  onUpdateField?: (
    fieldId: string,
    updates: Partial<RecordLayoutField>,
  ) => void;
}

export function FieldItem({
  field,
  index,
  onRemove,
  sectionId,
  columnKey,
  onUpdateField,
}: FieldItemProps) {
  const { active } = useDndContext();
  const activeType = active?.data.current?.type;
  const disableFieldSort = activeType === "section";

  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    data: {
      columnKey,
      fieldId: field.id,
      index,
      label: field.label,
      sectionId,
      type: "field",
    },
    disabled: disableFieldSort,
    id: `field-${sectionId}-${field.id}`,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 bg-muted/50 rounded group",
        isDragging && "opacity-50 shadow-lg",
      )}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center gap-2 flex-1">
        <button
          className="cursor-grab active:cursor-grabbing"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{field.label}</span>
            <Badge
              className={FIELD_TYPE_COLORS[field.type] || "bg-gray-100"}
              variant="secondary"
            >
              {field.type}
            </Badge>
            {/* availableOnCreate toggle for non-system fields */}
            {!("isSystem" in field && field.isSystem) && onUpdateField && (
              <button
                className={cn(
                  "text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer",
                  field.availableOnCreate === false
                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    : "bg-green-100 text-green-800 hover:bg-green-200",
                )}
                onClick={() =>
                  onUpdateField(field.id, {
                    availableOnCreate:
                      field.availableOnCreate === false ? true : false,
                  })
                }
                title={
                  field.availableOnCreate === false
                    ? "Update only - Click to show on create"
                    : "Available on create - Click to hide"
                }
                type="button"
              >
                {field.availableOnCreate === false ? "Update" : "Create"}
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {field.id}
          </div>
        </div>
      </div>
      <Button
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        size="sm"
        variant="ghost"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
