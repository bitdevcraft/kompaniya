import type { UniqueIdentifier } from "@dnd-kit/core";
import type { FormEvent } from "react";

import { useCallback, useEffect, useRef } from "react";

type UseContentEditableOptions = {
  id: UniqueIdentifier;
  content?: string;
  defaultContent?: string;
  preferDefaultWhenEmpty?: boolean;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
};

export function useContentEditable<T extends HTMLElement>({
  id,
  content,
  defaultContent = "",
  preferDefaultWhenEmpty = false,
  isActive,
  setActiveId,
  setNodeContent,
}: UseContentEditableOptions) {
  const contentRef = useRef<T>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const fallback = defaultContent ?? "";
    const nextContent = preferDefaultWhenEmpty
      ? content || fallback
      : (content ?? fallback);

    if (
      element.textContent !== nextContent &&
      (!isActive || document.activeElement !== element)
    ) {
      element.textContent = nextContent;
    }
  }, [content, defaultContent, preferDefaultWhenEmpty, isActive]);

  useEffect(() => {
    if (isActive) {
      contentRef.current?.focus();
    }
  }, [isActive]);

  const handleFocus = useCallback(() => {
    setActiveId(id);
  }, [id, setActiveId]);

  const handleInput = useCallback(
    (event: FormEvent<T>) => {
      setNodeContent(id, event.currentTarget.textContent ?? "");
    },
    [id, setNodeContent],
  );

  return { contentRef, handleFocus, handleInput };
}
