import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { useContentEditable } from "./use-content-editable";

type MjAccordionTitleNodeProps = {
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

export function MjAccordionTitleNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
}: MjAccordionTitleNodeProps) {
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
      aria-label="Accordion title"
      aria-multiline={false}
      className="min-h-8 border border-transparent bg-transparent px-1 py-1 text-sm font-semibold outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder="Accordion title..."
      onClick={(event) => event.stopPropagation()}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      }}
      ref={contentRef}
      role="textbox"
      style={contentStyles}
      suppressContentEditableWarning
    />
  );
}
