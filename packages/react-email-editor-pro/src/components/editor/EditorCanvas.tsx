import { type Editor, EditorContent } from "@tiptap/react";

import { cn } from "../../lib/utils";

interface EditorCanvasProps {
  editor: Editor | null;
  width: string;
  className?: string;
}

export function EditorCanvas({ editor, width, className }: EditorCanvasProps) {
  return (
    <div className={cn("flex-1 overflow-auto bg-slate-100 p-6", className)}>
      <div
        className="mx-auto min-h-[600px] rounded-lg bg-white p-6 shadow"
        style={{ width }}
      >
        <EditorContent className="min-h-[400px] outline-none" editor={editor} />
      </div>
    </div>
  );
}
