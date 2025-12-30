"use client";

import type { Editor, JSONContent } from "@tiptap/core";

import { cn } from "@kompaniya/ui-common/lib/utils";
import * as React from "react";
import { create } from "zustand";

import type { MjmlEditorContent, MjmlEditorUpdate } from "./mjml-editor";

import { MjmlEditor } from "./mjml-editor";

type MjmlEditorStore = {
  view: MjmlEditorView;
  html: string;
  json: JSONContent | null;
  text: string;
  setView: (view: MjmlEditorView) => void;
  setFromUpdate: (update: MjmlEditorUpdate) => void;
  setFromEditor: (editor: Editor) => void;
};

type MjmlEditorView = "editor" | "preview";

const useMjmlEditorStore = create<MjmlEditorStore>((set) => ({
  view: "editor",
  html: "",
  json: null,
  text: "",
  setView: (view) => set({ view }),
  setFromUpdate: (update) =>
    set({
      html: update.html,
      json: update.json,
      text: update.text,
    }),
  setFromEditor: (editor) =>
    set({
      html: editor.getHTML(),
      json: editor.getJSON(),
      text: editor.getText(),
    }),
}));

export type MjmlEditorPanelProps = {
  /**
   * Additional class name applied to the outer wrapper element.
   */
  className?: string;
  /**
   * Class name applied to the MJML editor prose container.
   */
  editorClassName?: string;
  /**
   * Initial content used when the editor is uncontrolled.
   */
  defaultContent?: MjmlEditorContent;
  /**
   * Initial view toggle value.
   */
  defaultView?: MjmlEditorView;
  /**
   * Called whenever the editor content changes.
   */
  onContentChange?: (update: MjmlEditorUpdate) => void;
  /**
   * Called once the editor instance is ready.
   */
  onEditorReady?: (editor: Editor) => void;
};

const fallbackContent: MjmlEditorContent = "<p></p>";

export function MjmlEditorPanel({
  className,
  editorClassName,
  defaultContent = fallbackContent,
  defaultView = "editor",
  onContentChange,
  onEditorReady,
}: MjmlEditorPanelProps) {
  const resolvedEditorClassName = cn(
    editorClassName,
    "text-slate-900 dark:text-slate-900",
  );
  const view = useMjmlEditorStore((state) => state.view);
  const html = useMjmlEditorStore((state) => state.html);
  const json = useMjmlEditorStore((state) => state.json);
  const setView = useMjmlEditorStore((state) => state.setView);
  const setFromUpdate = useMjmlEditorStore((state) => state.setFromUpdate);
  const setFromEditor = useMjmlEditorStore((state) => state.setFromEditor);

  React.useEffect(() => {
    setView(defaultView);
  }, [defaultView, setView]);

  const handleChange = React.useCallback(
    (update: MjmlEditorUpdate) => {
      setFromUpdate(update);
      onContentChange?.(update);
    },
    [onContentChange, setFromUpdate],
  );

  const handleEditorReady = React.useCallback(
    (editor: Editor) => {
      setFromEditor(editor);
      onEditorReady?.(editor);
    },
    [onEditorReady, setFromEditor],
  );

  const jsonOutput = React.useMemo(() => {
    return json ? JSON.stringify(json, null, 2) : "{}";
  }, [json]);

  return (
    <div
      className={cn(
        "flex min-h-[520px] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            MJML Editor
          </p>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Compose and preview
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            aria-pressed={view === "editor"}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              view === "editor"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
            onClick={() => setView("editor")}
            type="button"
          >
            Editor
          </button>
          <button
            aria-pressed={view === "preview"}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              view === "preview"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
            onClick={() => setView("preview")}
            type="button"
          >
            Preview
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              JSON Output
            </h3>
          </div>
          <pre className="flex-1 overflow-auto px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
            {jsonOutput}
          </pre>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className={cn(view === "editor" ? "block" : "hidden")}>
            <MjmlEditor
              className="rounded-lg border border-slate-200 bg-white"
              defaultContent={defaultContent}
              editorClassName={resolvedEditorClassName}
              onContentChange={handleChange}
              onEditorReady={handleEditorReady}
            />
          </div>
          <div
            className={cn(
              "h-full rounded-lg border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
              view === "preview" ? "block" : "hidden",
            )}
          >
            {html ? (
              <div
                className="space-y-3 text-sm"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start typing to see the preview.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
