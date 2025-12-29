import type { Editor } from "@tiptap/core";

export interface SlashCommandItem {
  title: string;
  description: string;
  command: ({
    editor,
    range,
  }: {
    editor: Editor;
    range: { from: number; to: number };
  }) => void;
}
