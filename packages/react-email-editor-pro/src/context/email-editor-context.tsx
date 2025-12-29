import type { Editor } from "@tiptap/react";

import { createContext, useContext } from "react";

export interface EmailEditorContextValue {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  selectedNode: SelectedNodeInfo | null;
  setSelectedNode: (node: SelectedNodeInfo | null) => void;
}

export interface SelectedNodeInfo {
  type: string;
  attrs: Record<string, unknown>;
}

export const EmailEditorContext = createContext<
  EmailEditorContextValue | undefined
>(undefined);

export function useEmailEditorContext() {
  const context = useContext(EmailEditorContext);
  if (!context) {
    throw new Error(
      "useEmailEditorContext must be used within EmailEditorProvider",
    );
  }
  return context;
}
