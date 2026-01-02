import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { useContentEditable } from "./use-content-editable";

type MjNavbarLinkNodeProps = {
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

export function MjNavbarLinkNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
  insertSiblingAfter,
}: MjNavbarLinkNodeProps) {
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
      aria-label="Navbar link"
      aria-multiline={false}
      className="inline-flex min-h-8 items-center border border-transparent bg-transparent px-1 py-1 text-sm font-medium outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder="Link text..."
      onClick={(event) => event.stopPropagation()}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          const newId = insertSiblingAfter(id, "mj-navbar-link");
          if (newId) {
            setActiveId(newId);
          }
        }
      }}
      ref={contentRef}
      role="textbox"
      style={{ ...contentStyles, whiteSpace: "nowrap" }}
      suppressContentEditableWarning
    />
  );
}
