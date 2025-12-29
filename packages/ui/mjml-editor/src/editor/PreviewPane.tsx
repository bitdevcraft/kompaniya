"use client";

import React from "react";

import { exportHTML, exportMJML } from "../converters";
import { useEditorStore } from "../store/editor.store";

export interface PreviewPaneProps {
  compileEndpoint?: string;
}

export function PreviewPane({ compileEndpoint }: PreviewPaneProps) {
  const doc = useEditorStore((state) => state.doc);
  const [html, setHtml] = React.useState("<p>Preview loading…</p>");
  const [errors, setErrors] = React.useState<Array<{ message: string }>>([]);

  React.useEffect(() => {
    const timer = window.setTimeout(async () => {
      const mjml = exportMJML(doc);
      if (!compileEndpoint) {
        setHtml(`<pre>${mjml.replaceAll("<", "&lt;")}</pre>`);
        setErrors([]);
        return;
      }

      const result = await exportHTML(mjml, { endpoint: compileEndpoint });
      setHtml(result.html || "<p>No HTML output.</p>");
      setErrors(result.errors ?? []);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [doc, compileEndpoint]);

  return (
    <section className="rounded border p-4">
      <header className="mb-3 text-sm font-semibold">Preview</header>
      {errors.length > 0 && (
        <div className="mb-3 rounded border border-destructive bg-destructive/10 p-2 text-xs">
          {errors.map((error, index) => (
            <div key={`${error.message}-${index}`}>{error.message}</div>
          ))}
        </div>
      )}
      <iframe className="h-[60vh] w-full rounded border" srcDoc={html} />
    </section>
  );
}
