import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
} from "@tiptap/react";

import { cn } from "../../lib/utils";

export function SectionComponent({ node, selected }: NodeViewProps) {
  const { backgroundColor, padding } = node.attrs as {
    backgroundColor?: string;
    padding?: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "relative border border-transparent transition",
        selected && "border-dashed border-blue-500",
      )}
      style={{ backgroundColor, padding }}
    >
      <NodeViewContent className="flex flex-wrap gap-4" />
    </NodeViewWrapper>
  );
}
