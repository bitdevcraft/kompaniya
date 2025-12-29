"use client";

import React from "react";

import type { StorageAdapter } from "../adapters/storage";
import type { TemplateDoc } from "../schema/types";

import { exportHTML, exportMJML } from "../converters";
import { useEditorStore } from "../store/editor.store";

export interface ToolbarProps {
  storage: StorageAdapter;
  onSave?: (doc: TemplateDoc) => void;
  onExport?: (output: {
    mjml: string;
    html: string;
    json: TemplateDoc;
  }) => void;
  compileEndpoint?: string;
}

export function Toolbar({
  storage,
  onSave,
  onExport,
  compileEndpoint,
}: ToolbarProps) {
  const doc = useEditorStore((state) => state.doc);
  const [saving, setSaving] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await storage.save(doc);
      onSave?.(doc);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const mjml = exportMJML(doc);
      const result = await exportHTML(mjml, { endpoint: compileEndpoint });
      onExport?.({ mjml, html: result.html, json: doc });
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="flex items-center gap-2 rounded border p-2">
      <button
        className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground"
        onClick={handleSave}
        type="button"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        className="rounded border px-3 py-1 text-sm"
        onClick={handleExport}
        type="button"
      >
        {exporting ? "Exporting…" : "Export"}
      </button>
    </header>
  );
}
