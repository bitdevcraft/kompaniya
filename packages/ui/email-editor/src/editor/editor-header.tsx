import { Button } from "@kompaniya/ui-common/components/button";
import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  Code2,
  Eye,
  Monitor,
  Redo2Icon,
  Smartphone,
  Tablet,
  Undo2Icon,
} from "lucide-react";

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
        <p className="text-sm font-semibold">Email UI Builder</p>
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
            <Undo2Icon />
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
            <Redo2Icon />
          </Button>
        </div>
        <div className="inline-flex rounded-md border bg-muted p-1 text-xs font-semibold">
          <Button
            className={cn(
              "rounded px-3 py-1",
              viewMode === "editor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewModeChange("editor")}
            size={"sm"}
            type="button"
            variant="ghost"
          >
            <Code2 />
          </Button>
          <Button
            className={cn(
              "rounded px-3 py-1",
              viewMode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewModeChange("preview")}
            size={"sm"}
            type="button"
            variant="ghost"
          >
            <Eye />
          </Button>
        </div>
        <div className="inline-flex rounded-md border bg-muted p-1 text-xs font-semibold">
          <Button
            className={cn(
              "rounded px-3 py-1",
              viewportMode === "web"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewportModeChange("web")}
            size={"sm"}
            type="button"
            variant="ghost"
          >
            <Monitor />
          </Button>
          <Button
            className={cn(
              "rounded px-3 py-1",
              viewportMode === "tablet"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewportModeChange("tablet")}
            size={"sm"}
            type="button"
            variant="ghost"
          >
            <Tablet />
          </Button>
          <Button
            className={cn(
              "rounded px-3 py-1",
              viewportMode === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => onViewportModeChange("mobile")}
            size={"sm"}
            type="button"
            variant="ghost"
          >
            <Smartphone />
          </Button>
        </div>
      </div>
    </header>
  );
}
