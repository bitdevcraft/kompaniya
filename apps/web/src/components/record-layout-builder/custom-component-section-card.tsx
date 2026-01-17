"use client";

import type { ComponentType } from "react";

import { useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import { Card } from "@kompaniya/ui-common/components/card";
import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  Activity,
  Building2,
  ChartColumn,
  DollarSign,
  GripVertical,
  Mail,
  Puzzle,
  Settings,
  Trash2,
} from "lucide-react";

import type { RecordLayoutSection } from "@/components/record-page/layout";
import type { ComponentCategory } from "@/lib/component-definitions";
import type { BuilderActions } from "@/lib/hooks/use-record-layout-builder";

import { getComponent } from "@/lib/component-definitions";

export interface CustomComponentSectionCardProps {
  section: RecordLayoutSection;
  columnKey: "header" | "firstColumn" | "secondColumn";
  index: number;
  actions: BuilderActions;
  isSelected: boolean;
  onSelect: () => void;
}

const CATEGORY_ICONS: Record<
  ComponentCategory,
  ComponentType<{ className?: string }>
> = {
  activity: Activity,
  analytics: ChartColumn,
  communication: Mail,
  custom: Puzzle,
  finance: DollarSign,
  organization: Building2,
  system: Settings,
};

export function CustomComponentSectionCard({
  section,
  columnKey,
  index,
  actions,
  isSelected,
  onSelect,
}: CustomComponentSectionCardProps) {
  const registered = section.componentId
    ? getComponent(section.componentId)
    : undefined;
  const definition = registered?.definition;
  const label = definition?.label || section.title || "Custom Component";
  const description = definition?.description;
  const Icon = definition
    ? (CATEGORY_ICONS[definition.category] ?? Puzzle)
    : Puzzle;

  const { active } = useDndContext();
  const activeType = active?.data.current?.type;
  const showFieldDrop = activeType === "field" || activeType === "palette";

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
      label,
      sectionId: section.id,
      type: "component-section",
    },
    disabled: showFieldDrop,
    id: `section-${section.id}`,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (confirm(`Delete component section "${label}"?`)) {
      actions.removeSection(section.id, columnKey);
    }
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
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold">{label}</h4>
            <Badge className="text-xs" variant="outline">
              Component
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
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

      {description ? (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      ) : null}

      <div className="border border-dashed rounded-md p-4 text-sm text-muted-foreground">
        Component will render here.
      </div>

      {!definition ? (
        <div className="mt-3 text-xs text-destructive">
          Component &quot;{section.componentId}&quot; is not registered.
        </div>
      ) : null}
    </Card>
  );
}
