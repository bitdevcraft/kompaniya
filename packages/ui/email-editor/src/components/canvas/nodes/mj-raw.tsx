import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { applyPaddingStyles, NodeStyles } from "./node-styles";
import { useContentEditable } from "./use-content-editable";

export const buildRawStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const contentStyles: React.CSSProperties = {};

  if (attributes["background-color"]) {
    containerStyles.backgroundColor = attributes["background-color"];
  }
  if (attributes["font-family"]) {
    contentStyles.fontFamily = attributes["font-family"];
  }
  if (attributes["font-size"]) {
    contentStyles.fontSize = attributes["font-size"];
  }
  if (attributes["line-height"]) {
    contentStyles.lineHeight = attributes["line-height"];
  }
  if (attributes["color"]) {
    contentStyles.color = attributes["color"];
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles };
};

type MjRawNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
};

export function MjRawNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
}: MjRawNodeProps) {
  const { contentRef, handleFocus, handleInput } =
    useContentEditable<HTMLDivElement>({
      id,
      content: node.content,
      isActive,
      setActiveId,
      setNodeContent,
    });

  return (
    <div
      aria-label="Raw HTML"
      aria-multiline={true}
      className="min-h-10 border border-dashed border-muted-foreground/40 bg-transparent px-2 py-1 text-xs font-mono outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder="Paste raw HTML..."
      onClick={(event) => event.stopPropagation()}
      onFocus={handleFocus}
      onInput={handleInput}
      ref={contentRef}
      role="textbox"
      style={{ ...contentStyles, whiteSpace: "pre-wrap" }}
      suppressContentEditableWarning
    />
  );
}
