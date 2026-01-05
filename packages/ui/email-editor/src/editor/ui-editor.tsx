"use client";

import type { CSSProperties } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@kompaniya/ui-common/components/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MjmlJsonNode } from "../types/ui-component";
import type { ViewportMode } from "../types/viewport";

import { Canvas } from "../components/canvas/canvas";
import { TreeView } from "../components/tree/tree-view";
import {
  selectActiveId,
  selectCanRedo,
  selectCanUndo,
  selectDoc,
  useEmailDocStore,
  useEmailUIStore,
} from "../store";
import { isEditableTarget } from "../utils/dom";
import { formatMjmlErrors, serializeMjml } from "../utils/mjml";
import { AttributesPanel } from "./attributes-panel";
import { EditorHeader } from "./editor-header";
import { OutputPanel } from "./output-panel";
import { TextToolbar } from "./text-toolbar";

type CssVars = CSSProperties & {
  [key: `--${string}`]: string | number;
};

export function UiEditor({
  initialValue,
}: {
  initialValue?: MjmlJsonNode | null;
}) {
  const data = useEmailDocStore(selectDoc);
  const toMjmlJson = useEmailDocStore((s) => s.toMjmlJson);
  const setFromMjmlJson = useEmailDocStore((s) => s.setFromMjmlJson);
  const undo = useEmailDocStore((s) => s.undo);
  const redo = useEmailDocStore((s) => s.redo);
  const canUndo = useEmailDocStore(selectCanUndo);
  const canRedo = useEmailDocStore(selectCanRedo);
  const activeId = useEmailUIStore(selectActiveId);
  const [htmlOutput, setHtmlOutput] = useState("");
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const [viewportMode, setViewportMode] = useState<ViewportMode>("web");
  const didApplyInitial = useRef(false);

  const viewportMaxWidth =
    viewportMode === "mobile"
      ? "375px"
      : viewportMode === "tablet"
        ? "768px"
        : "100%";

  const mjmlJson = useMemo(() => {
    void data;
    return toMjmlJson();
  }, [data, toMjmlJson]);
  const jsonOutput = useMemo(
    () => (mjmlJson ? JSON.stringify(mjmlJson, null, 2) : "{}"),
    [mjmlJson],
  );
  const mjmlOutput = useMemo(
    () => (mjmlJson ? serializeMjml(mjmlJson) : ""),
    [mjmlJson],
  );

  useEffect(() => {
    if (!initialValue || didApplyInitial.current) return;
    setFromMjmlJson(initialValue);
    didApplyInitial.current = true;
  }, [initialValue, setFromMjmlJson]);

  useEffect(() => {
    let cancelled = false;

    if (!mjmlOutput) {
      setHtmlOutput("");
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      try {
        const { default: mjml2html } = await import("mjml-browser");
        const result = mjml2html(mjmlOutput);
        const errorBanner = formatMjmlErrors(result.errors ?? []);
        const html = errorBanner
          ? `${errorBanner}\n${result.html}`
          : result.html;
        if (!cancelled) {
          setHtmlOutput(html);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown MJML error";
        if (!cancelled) {
          setHtmlOutput(`<!-- MJML compile failed: ${message} -->`);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mjmlOutput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const isUndo =
        (event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z";
      const isRedo =
        (event.ctrlKey || event.metaKey) &&
        (key === "y" || (event.shiftKey && key === "z"));

      if (isUndo) {
        if (!canUndo) return;
        event.preventDefault();
        undo();
        return;
      }

      if (isRedo) {
        if (!canRedo) return;
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  const sidebarStyle: CssVars = {
    "--sidebar-width-mobile": "20rem",
    "--sidebar-width": "20rem",
  };

  return (
    <div className="mx-auto flex h-screen max-h-screen w-full max-w-7xl min-h-0">
      <SidebarProvider className="min-h-0 w-full" style={sidebarStyle}>
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
          <EditorHeader
            canRedo={canRedo}
            canUndo={canUndo}
            onRedo={redo}
            onUndo={undo}
            onViewModeChange={setViewMode}
            onViewportModeChange={setViewportMode}
            viewMode={viewMode}
            viewportMode={viewportMode}
          />
          <div className="flex min-h-0 flex-1 gap-4">
            <main className="relative min-h-0 flex-1 overflow-auto rounded-lg border bg-muted/40">
              <div
                className="pointer-events-none absolute inset-0 rounded-lg"
                style={{
                  backgroundImage:
                    "radial-gradient(hsl(var(--muted-foreground) / 0.18) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="relative flex min-h-[60vh] flex-col gap-4 p-6">
                {viewMode === "editor" && (
                  <TextToolbar activeId={activeId} viewMode={viewMode} />
                )}
                <div
                  className="relative mx-auto w-full"
                  style={{ maxWidth: viewportMaxWidth }}
                >
                  <div className="rounded-xl border bg-background shadow-md ring-1 ring-black/5">
                    {viewMode === "editor" ? (
                      <Canvas viewportMode={viewportMode} />
                    ) : (
                      <iframe
                        className="block min-h-[85vh] h-full w-full bg-white"
                        srcDoc={
                          htmlOutput ||
                          "<div style='padding:16px'>No preview.</div>"
                        }
                        title="Live Preview"
                      />
                    )}
                  </div>
                </div>
              </div>
            </main>
            <Sidebar
              className="min-h-0 shrink-0 overflow-hidden rounded-lg border"
              collapsible="none"
              side="right"
            >
              <SidebarContent className="gap-0 overflow-hidden p-0">
                <Tabs
                  className="flex min-h-0 flex-1 flex-col"
                  defaultValue="attributes"
                >
                  <TabsList className="w-full shrink-0">
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="tree">Tree</TabsTrigger>
                    <TabsTrigger value="output">Output</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    className="min-h-0 flex-1 overflow-auto"
                    value="attributes"
                  >
                    <AttributesPanel activeId={activeId} />
                  </TabsContent>
                  <TabsContent
                    className="min-h-0 flex-1 overflow-auto"
                    value="output"
                  >
                    <OutputPanel
                      htmlOutput={htmlOutput}
                      jsonOutput={jsonOutput}
                      mjmlOutput={mjmlOutput}
                    />
                  </TabsContent>
                  <TabsContent
                    className="min-h-0 flex-1 overflow-auto"
                    value="tree"
                  >
                    <TreeView />
                  </TabsContent>
                </Tabs>
              </SidebarContent>
            </Sidebar>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
