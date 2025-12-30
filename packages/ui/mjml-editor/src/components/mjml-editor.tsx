"use client";

import type { Content, Editor, JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode, Slice } from "@tiptap/pm/model";

import { cn } from "@kompaniya/ui-common/lib/utils";
import { NodeSelection } from "@tiptap/pm/state";
import { dropPoint } from "@tiptap/pm/transform";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";

import {
  mjmlEmailExtensions,
  type MjmlJsonNode,
  mjmlJsonToMjmlString,
  mjmlJsonToTiptapJson,
  mjmlUniqueIdAttributeName,
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

const nodeSelectionTargets = new Set(["mjmlColumn", "mjmlSection"]);
const handleSelector = '[data-mjml-handle="true"]';

type DraggingPayload = {
  slice: Slice;
  move: boolean;
  node?: NodeSelection;
};

const getNodeUniqueId = (node: ProseMirrorNode | null) => {
  if (!node) {
    return null;
  }
  const attrs = node.attrs as Record<string, unknown>;
  const id = attrs[mjmlUniqueIdAttributeName];
  return typeof id === "string" && id.trim() ? id : null;
};

type FoundNodeMatch = { node: ProseMirrorNode; pos: number };

const findNodeByUniqueId = (
  doc: ProseMirrorNode,
  id: string,
): FoundNodeMatch | null => {
  let match: FoundNodeMatch | null = null;
  doc.descendants((node, pos) => {
    const attrs = node.attrs as Record<string, unknown>;
    if (attrs[mjmlUniqueIdAttributeName] === id) {
      match = { node, pos };
      return false;
    }
    return true;
  });
  return match;
};

const getEventElement = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    return target;
  }
  if (target instanceof Node) {
    return target.parentElement;
  }
  return null;
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

const resolveHandleTargetPos = (
  view: Editor["view"],
  target: EventTarget | null,
) => {
  const element = getEventElement(target);
  if (!element) {
    return null;
  }
  const handle = element.closest(handleSelector);
  if (!handle) {
    return null;
  }
  const nodeElement = handle.closest(".mjml-node");
  if (!nodeElement) {
    return null;
  }
  try {
    return view.posAtDOM(nodeElement, 0);
  } catch {
    return null;
  }
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
  const dragFromHandleRef = React.useRef<{
    selection: NodeSelection;
    slice: Slice;
    id: string;
  } | null>(null);

  React.useEffect(() => {
    contentChangeRef.current = onContentChange;
  }, [onContentChange]);

  React.useEffect(() => {
    editorReadyRef.current = onEditorReady;
  }, [onEditorReady]);

  const extensions = React.useMemo(() => {
    return [
      StarterKit.configure({
        document: false,
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
        handleClickOn(view, _pos, node, nodePos, _event, direct) {
          if (!direct || !nodeSelectionTargets.has(node.type.name)) {
            return false;
          }
          const selection = NodeSelection.create(view.state.doc, nodePos);
          view.dispatch(view.state.tr.setSelection(selection));
          return true;
        },
        handleDOMEvents: {
          mousedown(view, event) {
            const pos = resolveHandleTargetPos(view, event.target);
            if (pos === null) {
              return false;
            }
            const selection = NodeSelection.create(view.state.doc, pos);
            view.dispatch(view.state.tr.setSelection(selection));
            view.focus();
            return false;
          },
          dragstart(view, event) {
            const pos = resolveHandleTargetPos(view, event.target);
            if (pos === null) {
              const element = getEventElement(event.target);
              if (element) {
                const insideNode = element.closest(".mjml-node");
                if (insideNode) {
                  event.preventDefault();
                  return true;
                }
              }
              return false;
            }
            const selection = NodeSelection.create(view.state.doc, pos);
            const dragId = getNodeUniqueId(selection.node);
            if (!dragId) {
              return false;
            }
            if (!view.state.selection.eq(selection)) {
              view.dispatch(view.state.tr.setSelection(selection));
            }
            if (event.dataTransfer) {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", "mjml");
              event.dataTransfer.setData("text/mjml-node-id", dragId);
            }
            const slice = selection.content();
            dragFromHandleRef.current = { selection, slice, id: dragId };
            const viewWithDrag = view as typeof view & {
              dragging?: DraggingPayload | null;
            };
            viewWithDrag.dragging = {
              slice,
              move: true,
              node: selection,
            };
            return false;
          },
          dragend(view, _event) {
            if (dragFromHandleRef.current) {
              dragFromHandleRef.current = null;
              const viewWithDrag = view as typeof view & {
                dragging?: DraggingPayload | null;
              };
              viewWithDrag.dragging = null;
            }
            return false;
          },
          drop(view, event) {
            const pendingDrag = dragFromHandleRef.current;
            if (!pendingDrag) {
              return false;
            }
            const clearDragState = () => {
              dragFromHandleRef.current = null;
              const viewWithDrag = view as typeof view & {
                dragging?: DraggingPayload | null;
              };
              viewWithDrag.dragging = null;
            };
            event.preventDefault();
            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!coords) {
              clearDragState();
              return true;
            }
            const rawDropPos = dropPoint(
              view.state.doc,
              coords.pos,
              pendingDrag.slice,
            );
            if (typeof rawDropPos !== "number") {
              clearDragState();
              return true;
            }
            const dropPos = rawDropPos;
            const dragTarget = findNodeByUniqueId(
              view.state.doc,
              pendingDrag.id,
            );
            if (!dragTarget) {
              clearDragState();
              return true;
            }
            const { node, pos: fromPos } = dragTarget;
            const nodeSize = node.nodeSize;
            const fromEnd = fromPos + nodeSize;
            if (dropPos > fromPos && dropPos < fromEnd) {
              clearDragState();
              return true;
            }
            let insertPos = dropPos;
            if (fromPos < insertPos) {
              insertPos -= nodeSize;
            }
            const tr = view.state.tr
              .delete(fromPos, fromEnd)
              .insert(insertPos, node);
            view.dispatch(tr.scrollIntoView());
            clearDragState();
            return true;
          },
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
          background: #f1f5f9;
          border-radius: 16px;
          padding: 12px;
        }

        .mjml-editor__prose {
          min-height: 240px;
          outline: none;
          padding: 12px 16px 12px 32px;
          font-size: 14px;
          line-height: 1.6;
          color: #0f172a;
          font-family: "Helvetica", "Arial", sans-serif;
        }

        .mjml-editor__prose > * + * {
          margin-top: 1rem;
        }

        .mjml-node {
          position: relative;
          display: block;
          border-radius: 12px;
          border: 1px solid transparent;
          box-sizing: border-box;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }

        .mjml-node::before {
          content: attr(data-label);
          position: absolute;
          top: -10px;
          left: 34px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #64748b;
          background: #ffffff;
          padding: 2px 6px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 120ms ease, transform 120ms ease;
          pointer-events: none;
        }

        .mjml-node:hover {
          border-color: #e2e8f0;
        }

        .mjml-node:hover::before,
        .mjml-node:focus-within::before {
          opacity: 1;
          transform: translateY(0);
        }

        .mjml-node:focus-within {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.18);
        }

        .mjml-section {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 22px 16px 16px;
          background: #ffffff;
        }

        .mjml-column {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 22px;
        }

        .mjml-text {
          padding: 22px 25px 10px;
          white-space: pre-wrap;
        }

        .mjml-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 22px 18px 12px;
          border-radius: 8px;
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          text-decoration: none;
          max-width: 100%;
        }

        .mjml-image {
          display: block;
          width: 100%;
          padding: 22px 25px 10px;
          overflow: hidden;
          border-radius: 10px;
          background: #e2e8f0;
        }

        .mjml-image img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: inherit;
        }

        .mjml-divider {
          padding: 22px 25px 10px;
          border-top: 1px solid #e2e8f0;
          border-left: 0;
          border-right: 0;
          border-bottom: 0;
        }

        .mjml-spacer {
          width: 100%;
          min-height: 12px;
          padding-top: 22px;
          border-radius: 8px;
          background: rgba(148, 163, 184, 0.2);
        }

        .mjml-node__handle {
          position: absolute;
          top: 6px;
          left: 8px;
          width: 16px;
          height: 16px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          opacity: 0;
          transform: translateY(-2px);
          transition: opacity 120ms ease, transform 120ms ease,
            box-shadow 120ms ease;
        }

        .mjml-node__handle::before {
          content: "";
          width: 8px;
          height: 8px;
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 4px 4px;
          background-position: center;
        }

        .mjml-node:hover .mjml-node__handle,
        .mjml-node:focus-within .mjml-node__handle {
          opacity: 1;
          transform: translateY(0);
        }

        .mjml-node__handle:active {
          cursor: grabbing;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.16);
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

      `}</style>
    </div>
  );
}
