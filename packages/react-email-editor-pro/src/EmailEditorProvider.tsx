import type { Editor } from "@tiptap/react";

import { type PropsWithChildren, useMemo, useState } from "react";

import {
  EmailEditorContext,
  type SelectedNodeInfo,
} from "./context/email-editor-context";

export function EmailEditorProvider({ children }: PropsWithChildren) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(
    null,
  );

  const value = useMemo(
    () => ({
      editor,
      setEditor,
      selectedNode,
      setSelectedNode,
    }),
    [editor, selectedNode],
  );

  return (
    <EmailEditorContext.Provider value={value}>
      {children}
    </EmailEditorContext.Provider>
  );
}
