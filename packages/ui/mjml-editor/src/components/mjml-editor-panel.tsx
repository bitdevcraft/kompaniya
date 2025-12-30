"use client";

import type { Editor, JSONContent } from "@tiptap/core";

import { cn } from "@kompaniya/ui-common/lib/utils";
import { NodeSelection } from "@tiptap/pm/state";
import * as React from "react";
import { create } from "zustand";

import type { MjmlEditorContent, MjmlEditorUpdate } from "./mjml-editor";

import { MjmlEditor } from "./mjml-editor";
import {
  type MjmlJsonNode,
  mjmlJsonToMjmlString,
  tiptapJsonToMjmlJson,
} from "./mjml-extensions";

type MjmlEditorView = "editor" | "preview";
type MjmlOutputTab = "json" | "mjml" | "html";
type MjmlRenderer = (
  input: string,
  options?: { validationLevel?: string },
) => { html?: string };

type MjmlSidebarMode = "styles" | "output";

let mjmlRenderer: MjmlRenderer | null = null;
let mjmlRendererPromise: Promise<void> | null = null;

const loadMjmlRenderer = async (): Promise<MjmlRenderer | null> => {
  if (typeof window === "undefined") {
    return null;
  }
  if (mjmlRenderer) {
    return mjmlRenderer;
  }
  if (!mjmlRendererPromise) {
    mjmlRendererPromise = import("mjml-browser")
      .then((mod) => {
        const resolved =
          (mod as { default?: MjmlRenderer }).default ??
          (mod as unknown as MjmlRenderer);
        mjmlRenderer = resolved;
      })
      .catch(() => {
        mjmlRenderer = null;
      });
  }
  await mjmlRendererPromise;
  return mjmlRenderer;
};

const renderMjml = async (markup: string) => {
  const renderer = await loadMjmlRenderer();
  if (!renderer) {
    return "";
  }
  try {
    const result = renderer(markup, {
      validationLevel: "soft",
    }) as { html?: string };
    return result.html || "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to render MJML.";
    return `<pre>${message}</pre>`;
  }
};

type BorderParts = {
  width: string;
  style: string;
  color: string;
};

type MjmlNodeType =
  | "mjmlSection"
  | "mjmlColumn"
  | "mjmlText"
  | "mjmlButton"
  | "mjmlImage"
  | "mjmlDivider"
  | "mjmlSpacer";

type SelectedMjmlNode = {
  type: MjmlNodeType;
  label: string;
  attrs: Record<string, string | null>;
  pos: number;
};

const mjmlNodeLabels: Record<MjmlNodeType, string> = {
  mjmlSection: "Section",
  mjmlColumn: "Column",
  mjmlText: "Text",
  mjmlButton: "Button",
  mjmlImage: "Image",
  mjmlDivider: "Divider",
  mjmlSpacer: "Spacer",
};

const selectableNodeTypes = new Set<MjmlNodeType>(
  Object.keys(mjmlNodeLabels) as MjmlNodeType[],
);

const alignTypes = new Set<MjmlNodeType>([
  "mjmlButton",
  "mjmlColumn",
  "mjmlImage",
  "mjmlSection",
  "mjmlText",
]);

const widthTypes = new Set<MjmlNodeType>([
  "mjmlButton",
  "mjmlColumn",
  "mjmlDivider",
  "mjmlImage",
  "mjmlSection",
]);

const heightTypes = new Set<MjmlNodeType>(["mjmlImage", "mjmlSpacer"]);

const paddingTypes = new Set<MjmlNodeType>([
  "mjmlButton",
  "mjmlColumn",
  "mjmlDivider",
  "mjmlImage",
  "mjmlSection",
  "mjmlText",
]);

const typographyTypes = new Set<MjmlNodeType>(["mjmlButton", "mjmlText"]);

const fillTypes = new Set<MjmlNodeType>([
  "mjmlButton",
  "mjmlColumn",
  "mjmlSection",
  "mjmlText",
]);

const borderTypes = new Set<MjmlNodeType>([
  "mjmlButton",
  "mjmlColumn",
  "mjmlDivider",
  "mjmlImage",
  "mjmlSection",
]);

const radiusTypes = new Set<MjmlNodeType>([
  "mjmlButton",
  "mjmlColumn",
  "mjmlImage",
  "mjmlSection",
]);

const borderStyleOptions = [
  { label: "Default", value: "" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
  { label: "None", value: "none" },
];

const alignOptions = [
  { label: "Default", value: "" },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
];

const getSelectedMjmlNode = (editor: Editor): SelectedMjmlNode | null => {
  const { selection } = editor.state;
  if (selection instanceof NodeSelection) {
    const selectionNode = selection.node;
    if (selectableNodeTypes.has(selectionNode.type.name as MjmlNodeType)) {
      const type = selectionNode.type.name as MjmlNodeType;
      return {
        type,
        label: mjmlNodeLabels[type],
        attrs: selectionNode.attrs as Record<string, string | null>,
        pos: selection.from,
      };
    }
  }

  const { $from } = selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (selectableNodeTypes.has(node.type.name as MjmlNodeType)) {
      const type = node.type.name as MjmlNodeType;
      return {
        type,
        label: mjmlNodeLabels[type],
        attrs: node.attrs as Record<string, string | null>,
        pos: $from.before(depth),
      };
    }
  }
  return null;
};

const toInputValue = (value: unknown) => {
  if (value === null || typeof value === "undefined") {
    return "";
  }
  return String(value);
};

const normalizeAttrValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parseBorder = (value?: string | null): BorderParts => {
  if (!value) {
    return { width: "", style: "", color: "" };
  }
  const parts = value.split(/\s+/).filter(Boolean);
  let width = "";
  let style = "";
  let color = "";
  parts.forEach((part) => {
    if (!style && borderStyleOptions.some((opt) => opt.value === part)) {
      style = part;
      return;
    }
    if (!width && /\d/.test(part)) {
      width = part;
      return;
    }
    if (!color) {
      color = part;
    }
  });
  return { width, style, color };
};

const buildBorder = (border: BorderParts) => {
  const parts = [border.width, border.style, border.color].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
};

const isHexColor = (value: string) =>
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

const fieldInputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100";

const compactInputClassName = "text-center";

const InspectorSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border-t border-slate-200 px-4 py-3 first:border-t-0 dark:border-slate-800">
    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
      {title}
    </p>
    <div className="mt-3 space-y-2">{children}</div>
  </div>
);

const InspectorField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
    <span className="w-16 shrink-0">{label}</span>
    <div className="flex-1">{children}</div>
  </label>
);

const TextInput = ({
  value,
  placeholder,
  onChange,
  className,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <input
    className={cn(fieldInputClassName, className)}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    type="text"
    value={value}
  />
);

const SelectInput = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) => (
  <select
    className={fieldInputClassName}
    onChange={(event) => onChange(event.target.value)}
    value={value}
  >
    {options.map((option) => (
      <option key={option.value || option.label} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const ColorInput = ({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex items-center gap-2">
    <input
      className="h-7 w-8 rounded border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      onChange={(event) => onChange(event.target.value)}
      type="color"
      value={isHexColor(value) ? value : "#000000"}
    />
    <input
      className={fieldInputClassName}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  </div>
);

type MjmlEditorStore = {
  view: MjmlEditorView;
  sidebarMode: MjmlSidebarMode;
  sidebarTab: MjmlOutputTab;
  html: string;
  mjml: string;
  mjmlJson: MjmlJsonNode | null;
  json: JSONContent | null;
  text: string;
  setView: (view: MjmlEditorView) => void;
  setSidebarMode: (mode: MjmlSidebarMode) => void;
  setSidebarTab: (tab: MjmlOutputTab) => void;
  setHtml: (html: string) => void;
  setFromUpdate: (update: MjmlEditorUpdate) => void;
  setFromEditor: (editor: Editor) => void;
};

const emptyMjmlJson: MjmlJsonNode = {
  tagName: "mjml",
  content: [{ tagName: "mj-body", content: [] }],
};

const useMjmlEditorStore = create<MjmlEditorStore>((set) => ({
  view: "editor",
  sidebarMode: "styles",
  sidebarTab: "json",
  html: "",
  mjml: "",
  mjmlJson: null,
  json: null,
  text: "",
  setView: (view) => set({ view }),
  setSidebarMode: (sidebarMode) => set({ sidebarMode }),
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setHtml: (html) => set({ html }),
  setFromUpdate: (update) =>
    set(() => {
      const mjmlJson = update.mjmlJson ?? tiptapJsonToMjmlJson(update.json);
      const mjmlMarkup = update.mjml || mjmlJsonToMjmlString(mjmlJson);
      return {
        mjml: mjmlMarkup,
        mjmlJson,
        json: update.json,
        text: update.text,
      };
    }),
  setFromEditor: (editor) =>
    set(() => {
      const json = editor.getJSON();
      const mjmlJson = tiptapJsonToMjmlJson(json);
      const mjmlMarkup = mjmlJsonToMjmlString(mjmlJson);
      return {
        mjml: mjmlMarkup,
        mjmlJson,
        json,
        text: editor.getText(),
      };
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
  const sidebarMode = useMjmlEditorStore((state) => state.sidebarMode);
  const sidebarTab = useMjmlEditorStore((state) => state.sidebarTab);
  const html = useMjmlEditorStore((state) => state.html);
  const mjml = useMjmlEditorStore((state) => state.mjml);
  const mjmlJson = useMjmlEditorStore((state) => state.mjmlJson);
  const setView = useMjmlEditorStore((state) => state.setView);
  const setSidebarMode = useMjmlEditorStore((state) => state.setSidebarMode);
  const setSidebarTab = useMjmlEditorStore((state) => state.setSidebarTab);
  const setHtml = useMjmlEditorStore((state) => state.setHtml);
  const setFromUpdate = useMjmlEditorStore((state) => state.setFromUpdate);
  const setFromEditor = useMjmlEditorStore((state) => state.setFromEditor);
  const [editorInstance, setEditorInstance] = React.useState<Editor | null>(
    null,
  );
  const [selectedNode, setSelectedNode] =
    React.useState<SelectedMjmlNode | null>(null);

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
      setEditorInstance(editor);
      onEditorReady?.(editor);
    },
    [onEditorReady, setFromEditor],
  );

  React.useEffect(() => {
    if (!editorInstance) {
      return;
    }
    const updateSelection = () => {
      setSelectedNode(getSelectedMjmlNode(editorInstance));
    };
    updateSelection();
    editorInstance.on("selectionUpdate", updateSelection);
    editorInstance.on("transaction", updateSelection);
    return () => {
      editorInstance.off("selectionUpdate", updateSelection);
      editorInstance.off("transaction", updateSelection);
    };
  }, [editorInstance]);

  const updateSelectedAttributes = React.useCallback(
    (nextAttrs: Record<string, string | null>) => {
      if (!editorInstance || !selectedNode) {
        return;
      }
      const node = editorInstance.state.doc.nodeAt(selectedNode.pos);
      if (!node || node.type.name !== selectedNode.type) {
        return;
      }
      const mergedAttrs = { ...node.attrs, ...nextAttrs } as Record<
        string,
        string | null
      >;
      Object.keys(mergedAttrs).forEach((key) => {
        if (mergedAttrs[key] === "") {
          mergedAttrs[key] = null;
        }
      });
      const tr = editorInstance.state.tr.setNodeMarkup(
        selectedNode.pos,
        undefined,
        mergedAttrs,
      );
      editorInstance.view.dispatch(tr);
    },
    [editorInstance, selectedNode],
  );

  const selectedAttrs = selectedNode?.attrs ?? {};
  const selectedType = selectedNode?.type;

  const attrValue = (key: string) => toInputValue(selectedAttrs[key]);

  const setAttrValue = React.useCallback(
    (key: string, value: string) => {
      updateSelectedAttributes({ [key]: normalizeAttrValue(value) });
    },
    [updateSelectedAttributes],
  );

  const borderParts =
    selectedType === "mjmlDivider"
      ? {
          width: attrValue("borderWidth"),
          style: attrValue("borderStyle"),
          color: attrValue("borderColor"),
        }
      : parseBorder(attrValue("border"));

  const handleBorderChange = (next: Partial<BorderParts>) => {
    if (!selectedType) {
      return;
    }
    if (selectedType === "mjmlDivider") {
      const merged = {
        width: attrValue("borderWidth"),
        style: attrValue("borderStyle"),
        color: attrValue("borderColor"),
        ...next,
      };
      updateSelectedAttributes({
        borderWidth: normalizeAttrValue(merged.width),
        borderStyle: normalizeAttrValue(merged.style),
        borderColor: normalizeAttrValue(merged.color),
      });
      return;
    }
    const merged = {
      ...parseBorder(attrValue("border")),
      ...next,
    };
    updateSelectedAttributes({ border: buildBorder(merged) });
  };

  const supportsAlign = !!selectedType && alignTypes.has(selectedType);
  const supportsWidth = !!selectedType && widthTypes.has(selectedType);
  const supportsHeight = !!selectedType && heightTypes.has(selectedType);
  const supportsPadding = !!selectedType && paddingTypes.has(selectedType);
  const supportsTypography =
    !!selectedType && typographyTypes.has(selectedType);
  const supportsFill = !!selectedType && fillTypes.has(selectedType);
  const supportsBorder = !!selectedType && borderTypes.has(selectedType);
  const supportsBorderRadius = !!selectedType && radiusTypes.has(selectedType);
  const showLayoutSection =
    supportsAlign || supportsWidth || supportsHeight || supportsPadding;

  const jsonOutput = React.useMemo(() => {
    return JSON.stringify(mjmlJson ?? emptyMjmlJson, null, 2);
  }, [mjmlJson]);

  const mjmlOutput = React.useMemo(() => {
    return mjml || mjmlJsonToMjmlString(emptyMjmlJson);
  }, [mjml]);

  const htmlOutput = React.useMemo(() => {
    return html || "";
  }, [html]);

  React.useEffect(() => {
    let cancelled = false;
    void renderMjml(mjmlOutput).then((rendered) => {
      if (!cancelled) {
        setHtml(rendered);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mjmlOutput, setHtml]);

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
              Sidebar
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["styles", "output"] as const).map((mode) => (
                <button
                  aria-pressed={sidebarMode === mode}
                  className={cn(
                    "rounded-md border border-transparent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
                    sidebarMode === mode
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800",
                  )}
                  key={mode}
                  onClick={() => setSidebarMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {sidebarMode === "styles" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Selection
                </h4>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {selectedNode ? selectedNode.label : "No block selected"}
                </div>
                {!selectedNode && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Click a block inside the editor to edit its styles.
                  </p>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {selectedNode ? (
                  <>
                    {showLayoutSection && (
                      <InspectorSection title="Layout">
                        {supportsAlign && (
                          <InspectorField label="Align">
                            <SelectInput
                              onChange={(value) => setAttrValue("align", value)}
                              options={alignOptions}
                              value={attrValue("align")}
                            />
                          </InspectorField>
                        )}
                        {supportsWidth && (
                          <InspectorField label="Width">
                            <TextInput
                              onChange={(value) => setAttrValue("width", value)}
                              placeholder="auto"
                              value={attrValue("width")}
                            />
                          </InspectorField>
                        )}
                        {supportsHeight && (
                          <InspectorField label="Height">
                            <TextInput
                              onChange={(value) =>
                                setAttrValue("height", value)
                              }
                              placeholder="auto"
                              value={attrValue("height")}
                            />
                          </InspectorField>
                        )}
                        {supportsPadding && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                              Padding
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Top
                                <TextInput
                                  className={compactInputClassName}
                                  onChange={(value) =>
                                    setAttrValue("paddingTop", value)
                                  }
                                  placeholder="0"
                                  value={attrValue("paddingTop")}
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Right
                                <TextInput
                                  className={compactInputClassName}
                                  onChange={(value) =>
                                    setAttrValue("paddingRight", value)
                                  }
                                  placeholder="0"
                                  value={attrValue("paddingRight")}
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Bottom
                                <TextInput
                                  className={compactInputClassName}
                                  onChange={(value) =>
                                    setAttrValue("paddingBottom", value)
                                  }
                                  placeholder="0"
                                  value={attrValue("paddingBottom")}
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Left
                                <TextInput
                                  className={compactInputClassName}
                                  onChange={(value) =>
                                    setAttrValue("paddingLeft", value)
                                  }
                                  placeholder="0"
                                  value={attrValue("paddingLeft")}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </InspectorSection>
                    )}

                    {supportsTypography && (
                      <InspectorSection title="Typography">
                        <InspectorField label="Font">
                          <TextInput
                            onChange={(value) =>
                              setAttrValue("fontFamily", value)
                            }
                            placeholder="Helvetica, Arial"
                            value={attrValue("fontFamily")}
                          />
                        </InspectorField>
                        <InspectorField label="Size">
                          <TextInput
                            onChange={(value) =>
                              setAttrValue("fontSize", value)
                            }
                            placeholder="14px"
                            value={attrValue("fontSize")}
                          />
                        </InspectorField>
                        <InspectorField label="Weight">
                          <TextInput
                            onChange={(value) =>
                              setAttrValue("fontWeight", value)
                            }
                            placeholder="400"
                            value={attrValue("fontWeight")}
                          />
                        </InspectorField>
                        <InspectorField label="Line">
                          <TextInput
                            onChange={(value) =>
                              setAttrValue("lineHeight", value)
                            }
                            placeholder="1.4"
                            value={attrValue("lineHeight")}
                          />
                        </InspectorField>
                        <InspectorField label="Color">
                          <ColorInput
                            onChange={(value) => setAttrValue("color", value)}
                            placeholder="#111827"
                            value={attrValue("color")}
                          />
                        </InspectorField>
                      </InspectorSection>
                    )}

                    {supportsFill && (
                      <InspectorSection title="Fill">
                        <InspectorField label="Background">
                          <ColorInput
                            onChange={(value) =>
                              setAttrValue("backgroundColor", value)
                            }
                            placeholder="#ffffff"
                            value={attrValue("backgroundColor")}
                          />
                        </InspectorField>
                      </InspectorSection>
                    )}

                    {supportsBorder && (
                      <InspectorSection title="Border">
                        <InspectorField label="Width">
                          <TextInput
                            onChange={(value) =>
                              handleBorderChange({ width: value })
                            }
                            placeholder="1px"
                            value={borderParts.width}
                          />
                        </InspectorField>
                        <InspectorField label="Style">
                          <SelectInput
                            onChange={(value) =>
                              handleBorderChange({ style: value })
                            }
                            options={borderStyleOptions}
                            value={borderParts.style}
                          />
                        </InspectorField>
                        <InspectorField label="Color">
                          <ColorInput
                            onChange={(value) =>
                              handleBorderChange({ color: value })
                            }
                            placeholder="#94a3b8"
                            value={borderParts.color}
                          />
                        </InspectorField>
                        {supportsBorderRadius && (
                          <InspectorField label="Radius">
                            <TextInput
                              onChange={(value) =>
                                setAttrValue("borderRadius", value)
                              }
                              placeholder="8px"
                              value={attrValue("borderRadius")}
                            />
                          </InspectorField>
                        )}
                      </InspectorSection>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
                    Select a block to edit its styles.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Output
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["json", "mjml", "html"] as const).map((tab) => (
                    <button
                      aria-pressed={sidebarTab === tab}
                      className={cn(
                        "rounded-md border border-transparent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition",
                        sidebarTab === tab
                          ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                          : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800",
                      )}
                      key={tab}
                      onClick={() => setSidebarTab(tab)}
                      type="button"
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <pre className="flex-1 overflow-auto px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                {sidebarTab === "json" && jsonOutput}
                {sidebarTab === "mjml" && mjmlOutput}
                {sidebarTab === "html" && htmlOutput}
              </pre>
            </div>
          )}
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
