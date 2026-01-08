"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { RotateCcw, Save } from "lucide-react";

export interface BuilderToolbarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function BuilderToolbar({
  isDirty,
  onSave,
  onReset,
}: BuilderToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="text-sm text-muted-foreground">
        {isDirty ? (
          <span className="text-orange-600">You have unsaved changes</span>
        ) : (
          <span>All changes saved</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={onReset} size="sm" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button disabled={!isDirty} onClick={onSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Layout
        </Button>
      </div>
    </div>
  );
}
