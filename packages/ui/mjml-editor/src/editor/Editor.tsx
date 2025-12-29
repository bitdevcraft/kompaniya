"use client";

import React from "react";

import type { TemplateDoc } from "../schema/types";

import {
  type ImageUploadAdapter,
  LocalStorageAdapter,
  type StorageAdapter,
} from "../adapters/storage";
import { useEditorStore } from "../store/editor.store";
import { BlockCanvas } from "./BlockCanvas";
import { CommandPalette } from "./CommandPalette";
import { InspectorPanel } from "./InspectorPanel";
import { PreviewPane } from "./PreviewPane";
import { Toolbar } from "./Toolbar";

export interface EditorProps {
  initialDoc: TemplateDoc;
  storage?: StorageAdapter;
  onSave?: (doc: TemplateDoc) => void;
  onExport?: (output: {
    mjml: string;
    html: string;
    json: TemplateDoc;
  }) => void;
  compileEndpoint?: string;
  imageUploadAdapter?: ImageUploadAdapter;
}

export function MjmlEditor({
  initialDoc,
  storage,
  onSave,
  onExport,
  compileEndpoint,
  imageUploadAdapter,
}: EditorProps) {
  const { setDoc } = useEditorStore();
  const resolvedStorage = React.useMemo(
    () => storage ?? new LocalStorageAdapter(),
    [storage],
  );

  React.useEffect(() => setDoc(initialDoc), [initialDoc, setDoc]);

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-4">
      <Toolbar
        compileEndpoint={compileEndpoint}
        onExport={onExport}
        onSave={onSave}
        storage={resolvedStorage}
      />
      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="grid grid-cols-2 gap-4">
          <BlockCanvas />
          <PreviewPane compileEndpoint={compileEndpoint} />
        </div>
        <InspectorPanel imageUploadAdapter={imageUploadAdapter} />
      </div>
      <CommandPalette />
    </div>
  );
}
