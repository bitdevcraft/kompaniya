"use client";

import type { Content, Editor, JSONContent } from "@tiptap/core";

import { cn } from "@kompaniya/ui-common/lib/utils";
import DragHandle from "@tiptap/extension-drag-handle";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";

import {
  mjmlEmailExtensions,
  type MjmlJsonNode,
  mjmlJsonToMjmlString,
  mjmlJsonToTiptapJson,
  tiptapJsonToMjmlJson,
} from "./mjml-extensions";
export type MjmlEditorContent = Content | MjmlJsonNode;

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
  mjml: string;
  mjmlJson: MjmlJsonNode;
  text: string;
};

const fallbackContent: MjmlEditorContent = {
  type: "doc",
  content: [
    {
      type: "mjmlSection",
      content: [
        {
          type: "mjmlColumn",
          content: [
            {
              type: "mjmlText",
              content: [{ type: "text", text: "" }],
            },
          ],
        },
      ],
    },
  ],
};

const isMjmlJsonNode = (value: MjmlEditorContent): value is MjmlJsonNode => {
  const candidate = value as MjmlJsonNode;
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "tagName" in value &&
    typeof candidate.tagName === "string"
  );
};

const resolveContent = (value?: MjmlEditorContent): Content | undefined => {
  if (!value) {
    return undefined;
  }
  if (isMjmlJsonNode(value)) {
    return mjmlJsonToTiptapJson(value);
  }
  return value;
};

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
      StarterKit.configure({
        paragraph: false,
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      ...mjmlEmailExtensions,
      DragHandle.configure({
        render: createDragHandleElement,
      }),
    ];
  }, []);

  const editor = useEditor(
    {
      extensions,
      content: resolveContent(content ?? initialContent ?? fallbackContent),
      immediatelyRender: false,
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: cn("mjml-editor__prose", editorClassName),
        },
      },
      onUpdate({ editor }) {
        const json = editor.getJSON();
        const mjmlJson = tiptapJsonToMjmlJson(json);
        contentChangeRef.current?.({
          editor,
          html: editor.getHTML(),
          json,
          mjml: mjmlJsonToMjmlString(mjmlJson),
          mjmlJson,
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
    const resolvedContent = resolveContent(content);
    if (!resolvedContent) {
      return;
    }
    const isHtmlContent = typeof resolvedContent === "string";
    const incoming = isHtmlContent
      ? resolvedContent
      : JSON.stringify(
          Array.isArray(resolvedContent)
            ? { type: "doc", content: resolvedContent }
            : resolvedContent,
        );
    const current = isHtmlContent
      ? editor.getHTML()
      : JSON.stringify(editor.getJSON());
    if (incoming !== current) {
      editor.commands.setContent(resolvedContent);
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

        .mjml-node {
          position: relative;
          display: block;
          border: 1px dashed #cbd5f5;
          background: #f8fafc;
          border-radius: 10px;
          padding: 12px 14px;
        }

        .mjml-node:focus-within {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }

        .mjml-node::before {
          content: attr(data-label);
          display: block;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .mjml-section {
          background: #eef2ff;
        }

        .mjml-column {
          background: #ffffff;
        }

        .mjml-text {
          background: #f8fafc;
        }

        .mjml-button {
          background: #e0f2fe;
        }

        .mjml-image,
        .mjml-divider,
        .mjml-spacer {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .mjml-image::after,
        .mjml-divider::after,
        .mjml-spacer::after {
          content: attr(data-label);
          font-size: 12px;
          color: #64748b;
        }

        .mjml-slash-menu {
          position: absolute;
          z-index: 50;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
          padding: 6px;
          width: 260px;
        }

        .mjml-slash-item {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mjml-slash-item--active {
          background: #f1f5f9;
        }

        .mjml-slash-item__title {
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
        }

        .mjml-slash-item__description {
          font-size: 11px;
          color: #64748b;
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
