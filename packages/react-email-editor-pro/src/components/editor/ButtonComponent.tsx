import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";

import { cn } from "../../lib/utils";

export function ButtonComponent({ node, selected }: NodeViewProps) {
  const { href, backgroundColor, color, padding, align, text } = node.attrs as {
    href?: string;
    backgroundColor?: string;
    color?: string;
    padding?: string;
    align?: "left" | "center" | "right";
    text?: string;
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
    >
      <a
        className="rounded-md text-sm font-medium"
        href={href}
        style={{ backgroundColor, color, padding }}
      >
        {text}
      </a>
    </NodeViewWrapper>
  );
}
