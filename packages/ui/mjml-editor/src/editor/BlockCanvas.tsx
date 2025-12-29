"use client";

import React from "react";

import type { Block } from "../schema/types";

import { useEditorStore } from "../store/editor.store";

const renderBlockTree = (
  block: Block,
  blocks: Record<string, Block>,
  onSelect: (id: string) => void,
  level = 0,
): React.ReactNode => {
  const children = block.children ?? [];

  return (
    <li className="space-y-2" key={block.id}>
      <button
        className="flex items-center gap-2 rounded border px-2 py-1 text-left text-sm"
        onClick={() => onSelect(block.id)}
        type="button"
      >
        <span className="text-muted-foreground">{level + 1}.</span>
        <span className="font-medium">{block.type}</span>
        <span className="text-xs text-muted-foreground">{block.id}</span>
      </button>
      {children.length > 0 && (
        <ul className="ml-4 space-y-2 border-l pl-4">
          {children
            .map((childId) => blocks[childId])
            .filter((child): child is Block => Boolean(child))
            .map((child) =>
              renderBlockTree(child, blocks, onSelect, level + 1),
            )}
        </ul>
      )}
    </li>
  );
};

export function BlockCanvas() {
  const doc = useEditorStore((state) => state.doc);
  const setSelection = useEditorStore((state) => state.setSelection);
  const root = doc.blocks[doc.root];

  if (!root) {
    return <div className="rounded border p-4">No blocks found.</div>;
  }

  return (
    <section className="rounded border p-4">
      <header className="mb-3 text-sm font-semibold">Blocks</header>
      <ul className="space-y-2">
        {renderBlockTree(root, doc.blocks, setSelection)}
      </ul>
    </section>
  );
}
