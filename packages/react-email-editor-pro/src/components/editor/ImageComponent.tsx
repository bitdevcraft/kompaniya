import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";

import { cn } from "../../lib/utils";

export function ImageComponent({ node, selected }: NodeViewProps) {
  const { src, width, padding, align, alt } = node.attrs as {
    src?: string;
    width?: string;
    padding?: string;
    align?: "left" | "center" | "right";
    alt?: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "flex w-full border border-transparent",
        selected && "border-dashed border-blue-400",
        align === "center" && "justify-center",
        align === "left" && "justify-start",
        align === "right" && "justify-end",
      )}
      style={{ padding }}
    >
      <img alt={alt ?? ""} src={src} style={{ width }} />
    </NodeViewWrapper>
  );
}
