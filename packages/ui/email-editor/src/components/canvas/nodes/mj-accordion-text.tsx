import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { useContentEditable } from "./use-content-editable";

type MjAccordionTextNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
  insertSiblingAfter: (
    id: UniqueIdentifier,
    tagName: string,
  ) => UniqueIdentifier | null;
};

export function MjAccordionTextNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
}: MjAccordionTextNodeProps) {
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
      aria-label="Accordion content"
      aria-multiline={true}
      className="min-h-10 border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder="Accordion content..."
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
