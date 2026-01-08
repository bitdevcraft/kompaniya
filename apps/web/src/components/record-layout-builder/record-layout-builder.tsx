"use client";

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

export function RecordLayoutBuilder({
  entityType,
  initialLayout,
  onSave,
}: RecordLayoutBuilderProps) {
  const { state, actions } = useRecordLayoutBuilder(entityType, initialLayout);

  const handleSave = () => {
    onSave(state.layout);
  };

  const handleReset = () => {
    if (confirm("Reset to default layout? All customizations will be lost.")) {
      actions.reset();
    }
  };

  return (
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
  );
}
