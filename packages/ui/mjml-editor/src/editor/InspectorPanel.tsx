"use client";

import React from "react";

import type { ImageUploadAdapter } from "../adapters/storage";
import type { Block } from "../schema/types";

import { useEditorStore } from "../store/editor.store";

export interface InspectorPanelProps {
  imageUploadAdapter?: ImageUploadAdapter;
}

const formatBlock = (block: Block) => JSON.stringify(block.props, null, 2);

export function InspectorPanel({ imageUploadAdapter }: InspectorPanelProps) {
  const selection = useEditorStore((state) => state.selection);
  const doc = useEditorStore((state) => state.doc);
  const block = selection ? doc.blocks[selection] : undefined;

  return (
    <aside className="rounded border p-4">
      <header className="mb-3 text-sm font-semibold">Inspector</header>
      {block ? (
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Block</div>
            <div className="font-medium">{block.type}</div>
            <div className="text-xs text-muted-foreground">{block.id}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Props</div>
            <pre className="rounded bg-muted p-2 text-xs">
              {formatBlock(block)}
            </pre>
          </div>
          {imageUploadAdapter && (
            <div className="rounded border border-dashed p-2 text-xs text-muted-foreground">
              Image upload adapter connected.
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Select a block to edit its properties.
        </div>
      )}
    </aside>
  );
}
