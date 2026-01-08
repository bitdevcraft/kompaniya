"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { Card } from "@kompaniya/ui-common/components/card";
import { Input } from "@kompaniya/ui-common/components/input";
import { GripVertical, Trash2 } from "lucide-react";
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
  actions,
  isSelected,
  onSelect,
}: SectionCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(section.title);

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
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
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
      <div className="space-y-2">
        {section.fields.map((field) => (
          <FieldItem
            field={field}
            key={field.id}
            onRemove={() => handleRemoveField(field.id)}
          />
        ))}

        {section.fields.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded">
            No fields in this section
          </div>
        )}
      </div>

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
