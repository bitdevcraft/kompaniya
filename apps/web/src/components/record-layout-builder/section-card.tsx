"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@kompaniya/ui-common/components/button";
import { Card } from "@kompaniya/ui-common/components/card";
import { Input } from "@kompaniya/ui-common/components/input";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import React from "react";

import type { RecordLayoutSection } from "@/components/record-page/layout";
import type { BuilderActions } from "@/lib/hooks/use-record-layout-builder";

import { FieldItem } from "./field-item";

export interface SectionCardProps {
  section: RecordLayoutSection;
  columnKey: "header" | "firstColumn" | "secondColumn";
  index: number;
  actions: BuilderActions;
  isSelected: boolean;
  onSelect: () => void;
}

export function SectionCard({
  section,
  columnKey,
  index,
  actions,
  isSelected,
  onSelect,
}: SectionCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(section.title);

  const { active } = useDndContext();
  const activeType = active?.data.current?.type;
  const showFieldDrop = activeType === "field" || activeType === "palette";

  // Make the section draggable and sortable
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    data: {
      columnKey,
      index,
      label: section.title,
      sectionId: section.id,
      type: "section",
    },
    disabled: showFieldDrop,
    id: `section-${section.id}`,
  });

  // Make the field list droppable
  const { setNodeRef: setFieldDropNodeRef, isOver: isFieldOver } = useDroppable(
    {
      data: {
        columnKey,
        sectionId: section.id,
        type: "section-drop",
      },
      disabled: !showFieldDrop,
      id: `section-drop-${section.id}`,
    },
  );

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const isFieldDropActive = showFieldDrop && isFieldOver;

  const handleSaveTitle = () => {
    actions.updateSection(section.id, columnKey, { title });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete section "${section.title}"?`)) {
      actions.removeSection(section.id, columnKey);
    }
  };

  const handleRemoveField = (fieldId: string) => {
    actions.removeField(section.id, columnKey, fieldId);
  };

  return (
    <Card
      className={cn(
        "relative p-4 cursor-pointer transition-all",
        isSelected && "ring-2 ring-primary",
        isDragging && "opacity-50",
      )}
      onClick={onSelect}
      ref={setNodeRef}
      style={style}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <button
            className="cursor-grab active:cursor-grabbing"
            ref={setActivatorNodeRef}
            {...dragAttributes}
            {...dragListeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          {isEditing ? (
            <div
              className="flex items-center gap-2 flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                className="h-7 text-sm"
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setTitle(section.title);
                    setIsEditing(false);
                  }
                }}
                value={title}
              />
              <Button onClick={handleSaveTitle} size="sm" variant="ghost">
                Save
              </Button>
            </div>
          ) : (
            <h4
              className="font-semibold"
              onDoubleClick={() => setIsEditing(true)}
            >
              {section.title}
            </h4>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            size="sm"
            variant="ghost"
          >
            Edit
          </Button>
          <Button
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Section Description */}
      {section.description && (
        <p className="text-sm text-muted-foreground mb-3">
          {section.description}
        </p>
      )}

      {/* Section Fields */}
      <SortableContext
        items={section.fields.map((field) => `field-${section.id}-${field.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            "relative space-y-2 rounded-md p-2 -m-2 transition-colors",
            showFieldDrop &&
              "border-2 border-dashed border-muted-foreground/40",
            isFieldDropActive && "border-primary bg-primary/10",
          )}
          ref={setFieldDropNodeRef}
        >
          {section.fields.map((field, fieldIndex) => (
            <FieldItem
              columnKey={columnKey}
              field={field}
              index={fieldIndex}
              key={field.id}
              onRemove={() => handleRemoveField(field.id)}
              sectionId={section.id}
            />
          ))}

          {section.fields.length === 0 && (
            <div
              className={cn(
                "text-center py-4 text-sm border-2 border-dashed rounded transition-colors",
                isFieldDropActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {isFieldDropActive ? (
                <>
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  <span>Drop field here</span>
                </>
              ) : (
                "No fields in this section"
              )}
            </div>
          )}

          {isFieldDropActive && section.fields.length > 0 && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-primary">
                <Plus className="h-6 w-6" />
                <span className="font-medium">Drop field here</span>
              </div>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Section Settings */}
      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {section.columns ? `${section.columns} columns` : "Default columns"}
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((col) => (
            <Button
              className="h-6 w-6 p-0 text-xs"
              key={col}
              onClick={(e) => {
                e.stopPropagation();
                actions.updateSection(section.id, columnKey, {
                  columns: col as 1 | 2 | 3 | 4,
                });
              }}
              size="sm"
              variant={section.columns === col ? "default" : "outline"}
            >
              {col}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
