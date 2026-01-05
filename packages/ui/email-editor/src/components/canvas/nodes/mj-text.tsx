import type { UniqueIdentifier } from "@dnd-kit/core";
import type { FormEvent } from "react";

import { useCallback, useEffect, useRef } from "react";

import type { UiComponentConfig } from "../../../types/ui-component";

import {
  applyPaddingStyles,
  NodeStyles,
  toTextAlign,
  toTextTransform,
} from "./node-styles";

const normalizeLineBreaks = (value: string) =>
  value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const plainTextToHtml = (value: string) => {
  const normalized = normalizeLineBreaks(value);
  if (!normalized) return "";
  return escapeHtml(normalized).replace(/\n/g, "<br>");
};

const htmlToPlainText = (html: string) => {
  if (!html) return "";
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/p>/gi, "\n");

  if (typeof document === "undefined") {
    return normalizeLineBreaks(withBreaks.replace(/<[^>]+>/g, ""));
  }

  const container = document.createElement("div");
  container.innerHTML = withBreaks;
  return normalizeLineBreaks(container.textContent ?? "");
};

const shouldAutoFocus = (element: HTMLElement | null) => {
  if (!element || typeof document === "undefined") return false;
  const active = document.activeElement as HTMLElement | null;
  if (!active || active === element) return true;
  const tagName = active.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return false;
  }
  if (active.isContentEditable) return false;
  return true;
};

const isSelectionInside = (element: HTMLElement | null) => {
  if (!element || typeof document === "undefined") return false;
  const selection = document.getSelection();
  if (!selection) return false;
  const anchor = selection.anchorNode;
  const focus = selection.focusNode;
  return (
    (anchor && element.contains(anchor)) || (focus && element.contains(focus))
  );
};

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
  textStyles.whiteSpace = "pre-wrap";

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
}: MjTextNodeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const content = node.content ?? "";

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const nextText = htmlToPlainText(content);
    const currentText = normalizeLineBreaks(element.innerText);
    const isFocused = document.activeElement === element;
    const isEditing = isSelectionInside(element);
    if (currentText !== nextText && !isFocused && !isEditing) {
      element.innerText = nextText;
    }
  }, [content, isActive]);

  useEffect(() => {
    if (isActive && shouldAutoFocus(contentRef.current)) {
      contentRef.current?.focus();
    }
  }, [isActive]);

  const handleFocus = useCallback(() => {
    setActiveId(id);
  }, [id, setActiveId]);

  const syncFromElement = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      const nextText = normalizeLineBreaks(element.innerText);
      setNodeContent(id, plainTextToHtml(nextText));
    },
    [id, setNodeContent],
  );

  const handleInput = useCallback(
    (event: FormEvent<HTMLDivElement>) => {
      syncFromElement(event.currentTarget);
    },
    [syncFromElement],
  );

  return (
    <div
      aria-multiline
      className="min-h-8 border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      contentEditable
      data-placeholder="Type text..."
      onClick={(event) => event.stopPropagation()}
      onFocus={handleFocus}
      onInput={handleInput}
      ref={contentRef}
      role="textbox"
      style={contentStyles}
      suppressContentEditableWarning
    />
  );
}
