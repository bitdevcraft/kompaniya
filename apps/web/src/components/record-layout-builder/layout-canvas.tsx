"use client";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@kompaniya/ui-common/components/button";
import { Card } from "@kompaniya/ui-common/components/card";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { Plus } from "lucide-react";

import type { RecordLayoutSection } from "@/components/record-page/layout";
import type { RecordPageLayout } from "@/components/record-page/layout";
import type { BuilderActions } from "@/lib/hooks/use-record-layout-builder";

import { SectionCard } from "./section-card";

export interface LayoutCanvasProps {
  layout: RecordPageLayout;
  actions: BuilderActions;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string | null) => void;
}

export function LayoutCanvas({
  layout,
  actions,
  selectedSectionId,
  onSelectSection,
}: LayoutCanvasProps) {
  const sectionColumns = layout.sectionColumns || {};

  // Determine column layout based on sidebar setting
  const sidebar = sectionColumns.sidebar || null;
  const hasHeader =
    sectionColumns.header && sectionColumns.header.sections.length > 0;
  const hasFirstColumn =
    sectionColumns.firstColumn &&
    sectionColumns.firstColumn.sections.length > 0;
  const hasSecondColumn =
    sectionColumns.secondColumn &&
    sectionColumns.secondColumn.sections.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Column (full width) */}
      {hasHeader && (
        <ColumnContainer
          actions={actions}
          columnKey="header"
          onSelectSection={onSelectSection}
          sections={sectionColumns.header?.sections}
          selectedSectionId={selectedSectionId}
          title="Header"
        />
      )}

      {/* Two-column layout */}
      {(hasFirstColumn || hasSecondColumn) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColumnContainer
            actions={actions}
            columnKey="firstColumn"
            onSelectSection={onSelectSection}
            sections={sectionColumns.firstColumn?.sections}
            selectedSectionId={selectedSectionId}
            title={sidebar === "firstColumn" ? "Sidebar" : "Main Column"}
          />
          <ColumnContainer
            actions={actions}
            columnKey="secondColumn"
            onSelectSection={onSelectSection}
            sections={sectionColumns.secondColumn?.sections}
            selectedSectionId={selectedSectionId}
            title={sidebar === "secondColumn" ? "Sidebar" : "Secondary Column"}
          />
        </div>
      )}

      {/* Empty state */}
      {!hasHeader && !hasFirstColumn && !hasSecondColumn && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            This layout has no sections yet. Add sections to start building your
            layout.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              onClick={() =>
                actions.addSection("header", {
                  id: `section-${Date.now()}`,
                  title: "Header Section",
                  fields: [],
                })
              }
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Header Section
            </Button>
            <Button
              onClick={() =>
                actions.addSection("firstColumn", {
                  id: `section-${Date.now()}`,
                  title: "Main Section",
                  fields: [],
                })
              }
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Main Section
            </Button>
          </div>
        </Card>
      )}

      {/* Supplemental Fields */}
      {layout.supplementalFields && layout.supplementalFields.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Supplemental Fields</h3>
          <div className="text-sm text-muted-foreground">
            {layout.supplementalFields.length} supplemental fields
          </div>
        </Card>
      )}
    </div>
  );
}

function ColumnContainer({
  title,
  columnKey,
  sections,
  actions,
  selectedSectionId,
  onSelectSection,
}: {
  title: string;
  columnKey: "header" | "firstColumn" | "secondColumn";
  sections: RecordLayoutSection[] | undefined;
  actions: BuilderActions;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string | null) => void;
}) {
  const sectionsList = sections || [];
  const { active } = useDndContext();
  const activeType = active?.data.current?.type;
  const showSectionDrop = activeType === "section";

  const { setNodeRef, isOver } = useDroppable({
    data: {
      columnKey,
      type: "column",
    },
    disabled: !showSectionDrop,
    id: `column-${columnKey}`,
  });

  const handleAddSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      fields: [],
    };
    actions.addSection(columnKey, newSection);
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-4 bg-card transition-all relative",
        showSectionDrop && "border-dashed border-primary/40",
        isOver &&
          showSectionDrop &&
          "ring-2 ring-dashed ring-primary/50 bg-primary/5",
      )}
      ref={setNodeRef}
    >
      {isOver && showSectionDrop && (
        <div className="absolute inset-0 -m-4 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Plus className="h-8 w-8" />
            <span className="font-medium">Drop section here</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <Button onClick={handleAddSection} size="sm" variant="ghost">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      <SortableContext
        items={sectionsList.map((section) => `section-${section.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn("space-y-4", isOver && showSectionDrop && "opacity-30")}
        >
          {sectionsList.map((section, index) => (
            <SectionCard
              actions={actions}
              columnKey={columnKey}
              index={index}
              isSelected={selectedSectionId === section.id}
              key={section.id}
              onSelect={() => onSelectSection(section.id)}
              section={section}
            />
          ))}

          {sectionsList.length === 0 && (
            <div
              className={cn(
                "text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg",
                showSectionDrop && "border-primary/50 text-primary/70",
              )}
            >
              <p className="text-sm">No sections yet</p>
              <Button
                className="mt-2"
                onClick={handleAddSection}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
