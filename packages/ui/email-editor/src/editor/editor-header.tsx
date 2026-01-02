import { Button } from "@kompaniya/ui-common/components/button";
import { cn } from "@kompaniya/ui-common/lib/utils";

import type { ViewportMode } from "../types/viewport";

type ViewMode = "editor" | "preview";

export function EditorHeader({
  viewMode,
  viewportMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onViewModeChange,
  onViewportModeChange,
}: {
  viewMode: ViewMode;
  viewportMode: ViewportMode;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onViewportModeChange: (mode: ViewportMode) => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold">UI Builder</p>
        <p className="text-xs text-muted-foreground">
          Edit components or preview HTML output
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border bg-muted p-1 text-xs font-semibold">
          <Button
            aria-label="Undo (Ctrl+Z)"
            className="h-7 px-2 text-xs"
            disabled={!canUndo}
            onClick={onUndo}
            size="sm"
            title="Undo (Ctrl+Z)"
            type="button"
            variant="ghost"
          >
            Undo
          </Button>
          <Button
            aria-label="Redo (Ctrl+Y)"
            className="h-7 px-2 text-xs"
            disabled={!canRedo}
            onClick={onRedo}
            size="sm"
            title="Redo (Ctrl+Y)"
            type="button"
            variant="ghost"
          >
            Redo
          </Button>
        </div>
        <div className="inline-flex rounded-md border bg-muted p-1 text-xs font-semibold">
          <button
            className={cn(
              "rounded px-3 py-1",
              viewMode === "editor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewModeChange("editor")}
            type="button"
          >
            Editor
          </button>
          <button
            className={cn(
              "rounded px-3 py-1",
              viewMode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewModeChange("preview")}
            type="button"
          >
            Live Preview
          </button>
        </div>
        <div className="inline-flex rounded-md border bg-muted p-1 text-xs font-semibold">
          <button
            className={cn(
              "rounded px-3 py-1",
              viewportMode === "web"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewportModeChange("web")}
            type="button"
          >
            Web View
          </button>
          <button
            className={cn(
              "rounded px-3 py-1",
              viewportMode === "tablet"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewportModeChange("tablet")}
            type="button"
          >
            Tablet View
          </button>
          <button
            className={cn(
              "rounded px-3 py-1",
              viewportMode === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewportModeChange("mobile")}
            type="button"
          >
            Mobile View
          </button>
        </div>
      </div>
    </header>
  );
}
