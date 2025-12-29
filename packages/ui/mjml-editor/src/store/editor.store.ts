import { create } from "zustand";

import type { Block, TemplateDoc } from "../schema/types";

import { createEmptyDoc } from "../schema/types";

export interface EditorActions {
  setDoc: (doc: TemplateDoc) => void;
  setSelection: (id: string | null) => void;
  updateBlock: (blockId: string, updater: (block: Block) => Block) => void;
}

export interface EditorState {
  doc: TemplateDoc;
  selection: string | null;
  history: string[];
  future: string[];
}

export type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>((set, get) => ({
  doc: createEmptyDoc("Untitled email"),
  selection: null,
  history: [],
  future: [],
  setDoc: (doc) => set({ doc, history: [], future: [] }),
  setSelection: (id) => set({ selection: id }),
  updateBlock: (blockId, updater) => {
    const { doc } = get();
    const target = doc.blocks[blockId];
    if (!target) {
      return;
    }
    const updated = updater(target);
    set({
      doc: {
        ...doc,
        blocks: {
          ...doc.blocks,
          [blockId]: updated,
        },
      },
    });
  },
}));
