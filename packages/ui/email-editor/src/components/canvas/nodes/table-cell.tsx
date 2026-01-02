import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { useContentEditable } from "./use-content-editable";

type MjTableCellNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
};

type TableCellNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
  placeholder: string;
};

export function MjTableCellNode(props: MjTableCellNodeProps) {
  return <TableCellNode {...props} placeholder="Table cell..." />;
}

export function MjTableHeaderCellNode(props: MjTableCellNodeProps) {
  return <TableCellNode {...props} placeholder="Header cell..." />;
}

function TableCellNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
  placeholder,
}: TableCellNodeProps) {
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
      aria-multiline={true}
      className="min-h-8 w-full border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder={placeholder}
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
