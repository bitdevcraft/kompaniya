"use client";

import type { Content, Editor, JSONContent } from "@tiptap/core";

import { cn } from "@kompaniya/ui-common/lib/utils";
import DragHandle from "@tiptap/extension-drag-handle";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";

export type MjmlEditorContent = Content;

export type MjmlEditorProps = {
  /**
   * Additional class name applied to the outer wrapper element.
   */
  className?: string;
  /**
   * Class name applied to the ProseMirror content element.
   */
  editorClassName?: string;
  /**
   * Controlled content value for the editor.
   */
  content?: MjmlEditorContent;
  /**
   * Initial content used when the editor is uncontrolled.
   */
  defaultContent?: MjmlEditorContent;
  /**
   * Toggles whether the editor is editable.
   */
  editable?: boolean;
  /**
   * Autofocus behavior for the editor.
   */
  autofocus?: boolean;
  /**
   * Called whenever the editor content changes.
   */
  onContentChange?: (update: MjmlEditorUpdate) => void;
  /**
   * Called once the editor instance is ready.
   */
  onEditorReady?: (editor: Editor) => void;
};

export type MjmlEditorUpdate = {
  editor: Editor;
  html: string;
  json: JSONContent;
  text: string;
};

const fallbackContent: MjmlEditorContent = "<p></p>";

const createDragHandleElement = () => {
  const element = document.createElement("div");
  element.classList.add("drag-handle", "mjml-editor__drag-handle");
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("title", "Drag to move block");
  element.style.visibility = "hidden";
  element.style.pointerEvents = "none";
  return element;
};

export function MjmlEditor({
  className,
  editorClassName,
  content,
  defaultContent: initialContent,
  editable = true,
  autofocus = false,
  onContentChange,
  onEditorReady,
}: MjmlEditorProps) {
  const contentChangeRef = React.useRef(onContentChange);
  const editorReadyRef = React.useRef(onEditorReady);

  React.useEffect(() => {
    contentChangeRef.current = onContentChange;
  }, [onContentChange]);

  React.useEffect(() => {
    editorReadyRef.current = onEditorReady;
  }, [onEditorReady]);

  const extensions = React.useMemo(() => {
    return [
      StarterKit,
      DragHandle.configure({
        render: createDragHandleElement,
      }),
    ];
  }, []);

  const editor = useEditor(
    {
      extensions,
      content: content ?? initialContent ?? fallbackContent,
      immediatelyRender: false,
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: cn("mjml-editor__prose", editorClassName),
        },
      },
      onUpdate({ editor }) {
        contentChangeRef.current?.({
          editor,
          html: editor.getHTML(),
          json: editor.getJSON(),
          text: editor.getText(),
        });
      },
    },
    [],
  );

  React.useEffect(() => {
    if (!editor) {
      return;
    }
    editorReadyRef.current?.(editor);
  }, [editor]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
  }, [editor, editable]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }
    const nextClassName = cn("mjml-editor__prose", editorClassName);
    if (editor.view.dom.className !== nextClassName) {
      // eslint-disable-next-line react-hooks/immutability
      editor.view.dom.className = nextClassName;
    }
  }, [editor, editorClassName]);

  React.useEffect(() => {
    if (!editor || typeof content === "undefined") {
      return;
    }
    const isHtmlContent = typeof content === "string";
    const incoming = isHtmlContent
      ? content
      : JSON.stringify(
          Array.isArray(content) ? { type: "doc", content } : content,
        );
    const current = isHtmlContent
      ? editor.getHTML()
      : JSON.stringify(editor.getJSON());
    if (incoming !== current) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <EditorContent className="mjml-editor__content" editor={editor} />
      <style>{`
        .mjml-editor__content {
          position: relative;
        }

        .mjml-editor__prose {
          min-height: 240px;
          outline: none;
          padding: 16px 20px 16px 32px;
          font-size: 14px;
          line-height: 1.6;
        }

        .mjml-editor__prose > * + * {
          margin-top: 0.75rem;
        }

        .mjml-editor__drag-handle {
          width: 22px;
          height: 22px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          transition: transform 120ms ease, box-shadow 120ms ease,
            opacity 120ms ease;
          z-index: 30;
        }

        .mjml-editor__drag-handle::before {
          content: "";
          width: 10px;
          height: 10px;
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 4px 4px;
          background-position: center;
        }

        .mjml-editor__drag-handle:hover {
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.16);
          transform: translateX(-1px);
        }

        .mjml-editor__drag-handle[data-dragging="true"] {
          cursor: grabbing;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
