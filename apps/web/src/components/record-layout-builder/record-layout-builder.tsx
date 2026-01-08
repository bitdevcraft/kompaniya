"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";

import type { RecordLayoutField } from "@/components/record-page/layout";
import type { RecordLayoutResponse } from "@/lib/record-layouts";

import { useRecordLayoutBuilder } from "@/lib/hooks/use-record-layout-builder";

import { BuilderToolbar } from "./builder-toolbar";
import { FieldPalette } from "./field-palette";
import { LayoutCanvas } from "./layout-canvas";

export interface RecordLayoutBuilderProps {
  entityType: string;
  initialLayout: RecordLayoutResponse;
  onSave: (layout: unknown) => void;
}

type ColumnKey = "firstColumn" | "secondColumn" | "header";

type DragData =
  | {
      type: "palette";
      field: RecordLayoutField;
    }
  | {
      type: "field";
      fieldId: string;
      sectionId: string;
      columnKey: ColumnKey;
      index: number;
      label?: string;
    }
  | {
      type: "section";
      sectionId: string;
      columnKey: ColumnKey;
      index: number;
      label?: string;
    }
  | {
      type: "section-drop";
      sectionId: string;
      columnKey: ColumnKey;
    }
  | {
      type: "column";
      columnKey: ColumnKey;
    };

export function RecordLayoutBuilder({
  entityType,
  initialLayout,
  onSave,
}: RecordLayoutBuilderProps) {
  const { state, actions } = useRecordLayoutBuilder(entityType, initialLayout);
  const [activeData, setActiveData] = useState<{
    type: string;
    field?: RecordLayoutField;
    label?: string;
  } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleSave = () => {
    onSave(state.layout);
  };

  const handleReset = () => {
    if (confirm("Reset to default layout? All customizations will be lost.")) {
      actions.reset();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (!data) {
      setActiveData(null);
      return;
    }

    if (data.type === "palette") {
      setActiveData({
        type: "palette",
        field: data.field,
        label: data.field?.label,
      });
      return;
    }

    if (data.type === "field") {
      setActiveData({
        type: "field",
        label: data.label || "Field",
      });
      return;
    }

    if (data.type === "section") {
      setActiveData({
        type: "section",
        label: data.label || "Section",
      });
      return;
    }

    setActiveData(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveData(null);
      return;
    }

    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;
    if (!activeData || !overData) {
      setActiveData(null);
      return;
    }

    const getSections = (columnKey: ColumnKey) =>
      state.layout.sectionColumns?.[columnKey]?.sections ?? [];
    const findSectionIndex = (columnKey: ColumnKey, sectionId: string) =>
      getSections(columnKey).findIndex((section) => section.id === sectionId);
    const findFieldIndex = (
      columnKey: ColumnKey,
      sectionId: string,
      fieldId: string,
    ) => {
      const section = getSections(columnKey).find(
        (target) => target.id === sectionId,
      );
      if (!section) return -1;
      return section.fields.findIndex((field) => field.id === fieldId);
    };

    // Case 1: Palette field -> Section or field
    if (activeData.type === "palette") {
      if (overData.type === "section-drop") {
        const targetSection = getSections(overData.columnKey).find(
          (section) => section.id === overData.sectionId,
        );
        const toIndex = targetSection ? targetSection.fields.length : 0;
        actions.addField(
          overData.sectionId,
          overData.columnKey,
          activeData.field,
          toIndex,
        );
      }

      if (overData.type === "field") {
        const toIndex = findFieldIndex(
          overData.columnKey,
          overData.sectionId,
          overData.fieldId,
        );
        if (toIndex > -1) {
          actions.addField(
            overData.sectionId,
            overData.columnKey,
            activeData.field,
            toIndex,
          );
        }
      }
    }

    // Case 2: Field reordering within or between sections
    if (
      activeData.type === "field" &&
      (overData.type === "field" || overData.type === "section-drop")
    ) {
      const toIndex =
        overData.type === "field"
          ? findFieldIndex(
              overData.columnKey,
              overData.sectionId,
              overData.fieldId,
            )
          : (getSections(overData.columnKey).find(
              (section) => section.id === overData.sectionId,
            )?.fields.length ?? 0);

      if (toIndex < 0) {
        setActiveData(null);
        return;
      }

      if (
        activeData.sectionId === overData.sectionId &&
        activeData.columnKey === overData.columnKey &&
        (overData.type === "field"
          ? activeData.fieldId === overData.fieldId
          : activeData.index === toIndex)
      ) {
        setActiveData(null);
        return;
      }

      actions.moveField(
        activeData.sectionId,
        activeData.columnKey,
        overData.sectionId,
        overData.columnKey,
        activeData.fieldId,
        toIndex,
      );
    }

    // Case 3: Section reordering/moving
    if (
      activeData.type === "section" &&
      (overData.type === "section" || overData.type === "column")
    ) {
      const toColumnKey = overData.columnKey;
      const toIndex =
        overData.type === "section"
          ? findSectionIndex(overData.columnKey, overData.sectionId)
          : getSections(overData.columnKey).length;

      if (toIndex < 0) {
        setActiveData(null);
        return;
      }

      if (
        activeData.sectionId === overData.sectionId &&
        activeData.columnKey === toColumnKey
      ) {
        setActiveData(null);
        return;
      }

      actions.moveSection(
        activeData.columnKey,
        toColumnKey,
        activeData.sectionId,
        toIndex,
      );
    }

    setActiveData(null);
  };

  const handleDragCancel = () => {
    setActiveData(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Field Palette Sidebar */}
        <div className="lg:col-span-1">
          <FieldPalette fields={state.availableFields} />
        </div>

        {/* Main Builder Area */}
        <div className="lg:col-span-3">
          <BuilderToolbar
            isDirty={state.isDirty}
            onReset={handleReset}
            onSave={handleSave}
          />
          <LayoutCanvas
            actions={actions}
            layout={state.layout}
            onSelectSection={actions.setSelectedSection}
            selectedSectionId={state.selectedSectionId}
          />
        </div>
      </div>

      <DragOverlay>
        {activeData?.type === "palette" && activeData.field && (
          <div className="p-2 border rounded bg-card shadow-lg">
            <div className="text-sm font-medium">{activeData.field.label}</div>
          </div>
        )}
        {activeData?.type === "field" && (
          <div className="p-2 border rounded bg-card shadow-lg">
            <div className="text-sm font-medium">
              {activeData.label || "Field"}
            </div>
          </div>
        )}
        {activeData?.type === "section" && (
          <div className="p-3 border rounded bg-card shadow-lg">
            <div className="font-semibold">{activeData.label || "Section"}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
