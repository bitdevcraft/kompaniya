import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
} from "@tiptap/react";

import { cn } from "../../lib/utils";

export function ColumnComponent({ node, selected }: NodeViewProps) {
  const { width, padding, backgroundColor } = node.attrs as {
    width?: string;
    padding?: string;
    backgroundColor?: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "min-w-[200px] flex-1 border border-transparent transition",
        selected && "border-dashed border-blue-400",
      )}
      style={{ width, padding, backgroundColor }}
    >
      <NodeViewContent className="flex flex-col gap-3" />
    </NodeViewWrapper>
  );
}
