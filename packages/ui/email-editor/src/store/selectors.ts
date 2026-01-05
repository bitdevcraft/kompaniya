import type { UniqueIdentifier } from "@dnd-kit/core";

import type { EmailDocStore } from "./email-doc-store";
import type { EmailUIStore } from "./email-ui-store";

const EMPTY_IDS: UniqueIdentifier[] = [];
const EMPTY_ATTRIBUTES: Record<string, string> = {};

export const selectDoc = (state: EmailDocStore) => state.doc;
export const selectHistory = (state: EmailDocStore) => state.history;
export const selectCanUndo = (state: EmailDocStore) =>
  state.history.past.length > 0;
export const selectCanRedo = (state: EmailDocStore) =>
  state.history.future.length > 0;

export const selectNodeById =
  (id: UniqueIdentifier) => (state: EmailDocStore) =>
    state.doc[id];
export const selectNodeTag = (id: UniqueIdentifier) => (state: EmailDocStore) =>
  state.doc[id]?.tagName;
export const selectNodeAttributes =
  (id: UniqueIdentifier) => (state: EmailDocStore) =>
    state.doc[id]?.attributes ?? EMPTY_ATTRIBUTES;
export const selectNodeItems =
  (id: UniqueIdentifier) => (state: EmailDocStore) =>
    state.doc[id]?.items ?? EMPTY_IDS;

export const selectRenderableItems =
  (id: UniqueIdentifier) => (state: EmailDocStore) => {
    const node = state.doc[id];
    if (!node) return EMPTY_IDS;
    if (node.tagName !== "mjml") return node.items;
    return node.items.filter(
      (childId) => state.doc[childId]?.tagName !== "mj-head",
    );
  };

export const selectIsDescendantOfTag =
  (id: UniqueIdentifier, tagName: string) => (state: EmailDocStore) => {
    let currentId: UniqueIdentifier | undefined = id;

    while (currentId) {
      const current = state.doc[currentId];
      if (!current) return false;
      if (current.tagName === tagName) return true;
      currentId = current.parent as UniqueIdentifier | undefined;
    }

    return false;
  };

export const selectActiveId = (state: EmailUIStore) => state.activeId;
export const selectHoverId = (state: EmailUIStore) => state.hoverActiveId;
export const selectDragId = (state: EmailUIStore) => state.dragActiveId;
