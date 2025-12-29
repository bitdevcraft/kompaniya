import type { Editor } from "@tiptap/react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export type DeviceMode = "mobile" | "tablet" | "desktop";

interface MenuBarProps {
  editor: Editor | null;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  onExport: () => void;
  className?: string;
}

export function MenuBar({
  editor,
  device,
  onDeviceChange,
  onExport,
  className,
}: MenuBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Device</span>
        <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {(["mobile", "tablet", "desktop"] as const).map((mode) => (
            <Button
              className={cn(
                "px-2 py-1 text-xs",
                device === mode && "border-blue-500 bg-blue-50 text-blue-700",
              )}
              key={mode}
              onClick={() => onDeviceChange(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Undo
        </Button>
        <Button
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Redo
        </Button>
        <Button onClick={onExport}>Export</Button>
      </div>
    </div>
  );
}
