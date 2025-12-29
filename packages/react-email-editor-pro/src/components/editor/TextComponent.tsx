import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
} from "@tiptap/react";

import { cn } from "../../lib/utils";

export function TextComponent({ node, selected }: NodeViewProps) {
  const { align, color, fontSize, padding } = node.attrs as {
    align?: "left" | "center" | "right";
    color?: string;
    fontSize?: string;
    padding?: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "rounded-md border border-transparent",
        selected && "border-dashed border-blue-300",
      )}
      style={{ textAlign: align, color, fontSize, padding }}
    >
      <NodeViewContent className="outline-none" />
    </NodeViewWrapper>
  );
}
