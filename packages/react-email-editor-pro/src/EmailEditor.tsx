import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

import { Document } from "@tiptap/extension-document";
import { History } from "@tiptap/extension-history";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import { useEffect, useMemo, useState } from "react";

import { EditorCanvas } from "./components/editor/EditorCanvas";
import { type DeviceMode, MenuBar } from "./components/editor/MenuBar";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useEmailEditorContext } from "./context/email-editor-context";
import { EmailEditorProvider } from "./EmailEditorProvider";
import { MjButton } from "./extensions/MjButton";
import { MjColumn } from "./extensions/MjColumn";
import { MjImage } from "./extensions/MjImage";
import { MjSection } from "./extensions/MjSection";
import { MjText } from "./extensions/MjText";
import { SlashCommand } from "./extensions/SlashCommand";
import { jsonToMjml, mjmlToHtml } from "./lib/mjml-generator";

export interface EmailEditorProps {
  initialContent?: JSONContent;
  onExport?: (html: string, mjml: string, json: JSONContent) => void;
  theme?: "light" | "dark";
  className?: string;
}

const defaultContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "mj-section",
      content: [
        {
          type: "mj-column",
          content: [
            {
              type: "mj-text",
              content: [{ type: "text", text: "Start building your email..." }],
            },
          ],
        },
      ],
    },
  ],
};

export function EmailEditor(props: EmailEditorProps) {
  return (
    <EmailEditorProvider>
      <EmailEditorRoot {...props} />
    </EmailEditorProvider>
  );
}

function EmailEditorRoot({
  initialContent,
  onExport,
  className,
  theme = "light",
}: EmailEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      MjSection,
      MjColumn,
      MjText,
      MjImage,
      MjButton,
      SlashCommand,
    ],
    content: initialContent ?? defaultContent,
  });

  const { setEditor, setSelectedNode } = useEmailEditorContext();
  const [device, setDevice] = useState<DeviceMode>("desktop");

  useEffect(() => {
    setEditor(editor ?? null);
    return () => setEditor(null);
  }, [editor, setEditor]);

  useSelectedNode(editor ?? null, setSelectedNode);

  const width = useMemo(() => {
    if (device === "mobile") return "320px";
    if (device === "tablet") return "768px";
    return "600px";
  }, [device]);

  const handleExport = () => {
    if (!editor) return;
    const json = editor.getJSON();
    const mjml = jsonToMjml(json);
    const html = mjmlToHtml(mjml);
    onExport?.(html, mjml, json);
  };

  return (
    <div className={className ?? "flex h-full flex-col"} data-theme={theme}>
      <MenuBar
        device={device}
        editor={editor}
        onDeviceChange={setDevice}
        onExport={handleExport}
      />
      <div className="flex flex-1 overflow-hidden">
        <EditorCanvas className="flex-1" editor={editor} width={width} />
        <Sidebar />
      </div>
    </div>
  );
}

function useSelectedNode(
  editor: Editor | null,
  setSelectedNode: (
    node: { type: string; attrs: Record<string, unknown> } | null,
  ) => void,
) {
  useEffect(() => {
    if (!editor) return undefined;

    const updateSelectedNode = () => {
      const { $from } = editor.state.selection;
      for (let depth = $from.depth; depth >= 1; depth -= 1) {
        const node = $from.node(depth);
        const type = node.type.name;
        if (type.startsWith("mj-")) {
          setSelectedNode({
            type,
            attrs: node.attrs as Record<string, unknown>,
          });
          return;
        }
      }
      setSelectedNode(null);
    };

    updateSelectedNode();
    editor.on("selectionUpdate", updateSelectedNode);
    editor.on("transaction", updateSelectedNode);

    return () => {
      editor.off("selectionUpdate", updateSelectedNode);
      editor.off("transaction", updateSelectedNode);
    };
  }, [editor, setSelectedNode]);
}

export { useEmailEditorContext } from "./context/email-editor-context";
export { EmailEditorProvider } from "./EmailEditorProvider";
