"use client";

import { MjmlEditorPanel } from "@kompaniya/ui-mjml-editor/components/mjml-editor-panel";

const initialContent = `
<h2>Welcome to the MJML editor</h2>
<p>Start typing to see the live preview update in real time.</p>
`;

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            MJML Editor Playground
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            Layout with sidebar and toggle header
          </h1>
          <p className="text-sm text-slate-400">
            The editor panel shares state with the JSON output sidebar.
          </p>
        </div>
        <MjmlEditorPanel className="bg-white" defaultContent={initialContent} />
      </div>
    </div>
  );
}
