"use client";

import type { JSONContent } from "@tiptap/core";
import { useState } from "react";
import { EmailEditor } from "react-email-editor-pro";

interface ExportedState {
  html: string;
  mjml: string;
  json: JSONContent;
}

export default function Page() {
  const [exported, setExported] = useState<ExportedState | null>(null);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">Email Editor</h1>
        <p className="text-sm text-slate-500">
          Use the toolbar to export your email to JSON, MJML, or HTML.
        </p>
      </div>
      <div className="flex min-h-[600px] flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
        <EmailEditor
          className="flex min-h-[600px] flex-1"
          onExport={(html, mjml, json) => {
            setExported({ html, mjml, json });
          }}
        />
      </div>
      {exported && (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">JSON</h2>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
              {JSON.stringify(exported.json, null, 2)}
            </pre>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">MJML</h2>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
              {exported.mjml}
            </pre>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">HTML</h2>
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
              {exported.html}
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}
