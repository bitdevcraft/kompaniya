import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import {
  applyPaddingStyles,
  NodeStyles,
  toTextAlign,
  toTextTransform,
} from "./node-styles";
import { useContentEditable } from "./use-content-editable";

export const buildTextStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const textStyles: React.CSSProperties = {};
  const containerStyles: React.CSSProperties = {};
  const hasPadding =
    attributes["padding"] ||
    attributes["padding-top"] ||
    attributes["padding-right"] ||
    attributes["padding-bottom"] ||
    attributes["padding-left"];

  const align = attributes["align"] || attributes["text-align"];
  if (align) textStyles.textAlign = toTextAlign(align);

  textStyles.color = attributes["color"] ?? "#000000";
  if (attributes["font-family"]) {
    textStyles.fontFamily = attributes["font-family"];
  }
  textStyles.fontSize = attributes["font-size"] ?? "13px";
  if (attributes["font-style"]) textStyles.fontStyle = attributes["font-style"];
  if (attributes["font-weight"]) {
    textStyles.fontWeight = attributes["font-weight"];
  }
  textStyles.lineHeight = attributes["line-height"] ?? "1";
  if (attributes["letter-spacing"]) {
    textStyles.letterSpacing = attributes["letter-spacing"];
  }
  if (attributes["text-decoration"]) {
    textStyles.textDecoration = attributes["text-decoration"];
  }
  if (attributes["text-transform"]) {
    textStyles.textTransform = toTextTransform(attributes["text-transform"]);
  }
  if (attributes["height"]) textStyles.height = attributes["height"];

  if (attributes["background-color"]) {
    textStyles.backgroundColor = attributes["background-color"];
  }

  if (attributes["container-background-color"]) {
    containerStyles.backgroundColor = attributes["container-background-color"];
  }

  if (!hasPadding) {
    textStyles.padding = "10px 25px";
  }

  applyPaddingStyles(textStyles, attributes);

  return { containerStyles, contentStyles: textStyles };
};

type MjTextNodeProps = {
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

export function MjTextNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
  insertSiblingAfter,
}: MjTextNodeProps) {
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
      aria-multiline={false}
      className="min-h-8 border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder="Type text..."
      onClick={(event) => event.stopPropagation()}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          const newId = insertSiblingAfter(id, "mj-text");
          if (newId) {
            setActiveId(newId);
          }
        }
      }}
      ref={contentRef}
      role="textbox"
      style={contentStyles}
      suppressContentEditableWarning
    />
  );
}
