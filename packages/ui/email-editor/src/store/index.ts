"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";

import type { MjmlJsonNode } from "../types/ui-component";

import { type ComponentData, useEmailDocStore } from "./email-doc-store";
import { useEmailUIStore } from "./email-ui-store";

const syncUiWithDoc = (doc: ComponentData) => {
  useEmailUIStore.setState((state) => {
    const hasId = (id: UniqueIdentifier | "") =>
      Boolean(id && doc[id as UniqueIdentifier]);

    const nextActiveId = hasId(state.activeId) ? state.activeId : "";
    const nextHoverId = hasId(state.hoverActiveId) ? state.hoverActiveId : "";
    const nextDragId = hasId(state.dragActiveId) ? state.dragActiveId : "";
    const nextSelection = state.selectionIds.filter((id) => Boolean(doc[id]));
    const selectionIds =
      nextSelection.length > 0
        ? nextSelection
        : nextActiveId
          ? [nextActiveId as UniqueIdentifier]
          : [];
    const isSameSelection =
      selectionIds.length === state.selectionIds.length &&
      selectionIds.every((id, index) => id === state.selectionIds[index]);

    if (
      nextActiveId === state.activeId &&
      nextHoverId === state.hoverActiveId &&
      nextDragId === state.dragActiveId &&
      isSameSelection
    ) {
      return state;
    }

    return {
      ...state,
      activeId: nextActiveId,
      hoverActiveId: nextHoverId,
      dragActiveId: nextDragId,
      selectionIds: isSameSelection ? state.selectionIds : selectionIds,
    };
  });
};

useEmailDocStore.subscribe((state) => state.doc, syncUiWithDoc, {
  fireImmediately: true,
});

export const emailDocActions = {
  setDoc: (doc: ComponentData, options?: { resetHistory?: boolean }) =>
    useEmailDocStore.getState().setDoc(doc, options),
  appendComponent: (parentId: UniqueIdentifier, tagName: string) =>
    useEmailDocStore.getState().appendComponent(parentId, tagName),
  appendChild: (parentId: UniqueIdentifier, tagName: string) =>
    useEmailDocStore.getState().appendChild(parentId, tagName),
  appendTableWithSize: (
    parentId: UniqueIdentifier,
    rows: number,
    columns: number,
  ) => useEmailDocStore.getState().appendTableWithSize(parentId, rows, columns),
  appendTableRow: (tableId: UniqueIdentifier) =>
    useEmailDocStore.getState().appendTableRow(tableId),
  appendTableColumn: (tableId: UniqueIdentifier) =>
    useEmailDocStore.getState().appendTableColumn(tableId),
  insertSiblingAfter: (id: UniqueIdentifier, tagName: string) =>
    useEmailDocStore.getState().insertSiblingAfter(id, tagName),
  moveComponent: (droppableId: UniqueIdentifier, id: UniqueIdentifier) =>
    useEmailDocStore.getState().moveComponent(droppableId, id),
  duplicateComponent: (
    id: UniqueIdentifier,
    targetParentId?: UniqueIdentifier,
  ) => useEmailDocStore.getState().duplicateComponent(id, targetParentId),
  removeComponent: (id: UniqueIdentifier) =>
    useEmailDocStore.getState().removeComponent(id),
  setNodeAttribute: (id: UniqueIdentifier, key: string, value: string) =>
    useEmailDocStore.getState().setNodeAttribute(id, key, value),
  removeNodeAttribute: (id: UniqueIdentifier, key: string) =>
    useEmailDocStore.getState().removeNodeAttribute(id, key),
  renameNodeAttribute: (id: UniqueIdentifier, fromKey: string, toKey: string) =>
    useEmailDocStore.getState().renameNodeAttribute(id, fromKey, toKey),
  setNodeContent: (id: UniqueIdentifier, content: string) =>
    useEmailDocStore.getState().setNodeContent(id, content),
  setHeadDefaults: (id: UniqueIdentifier) =>
    useEmailDocStore.getState().setHeadDefaults(id),
  clearHead: (id: UniqueIdentifier) =>
    useEmailDocStore.getState().clearHead(id),
  setFromMjmlJson: (root: MjmlJsonNode) =>
    useEmailDocStore.getState().setFromMjmlJson(root),
  toMjmlJson: () => useEmailDocStore.getState().toMjmlJson(),
  undo: () => useEmailDocStore.getState().undo(),
  redo: () => useEmailDocStore.getState().redo(),
};

export const emailUIActions = {
  setActiveId: (id: UniqueIdentifier | "") =>
    useEmailUIStore.getState().setActiveId(id),
  setSelectionIds: (ids: UniqueIdentifier[]) =>
    useEmailUIStore.getState().setSelectionIds(ids),
  setHoverActiveId: (id: UniqueIdentifier | "") =>
    useEmailUIStore.getState().setHoverActiveId(id),
  setDragActiveId: (id: UniqueIdentifier | "") =>
    useEmailUIStore.getState().setDragActiveId(id),
  resetInteraction: () => useEmailUIStore.getState().resetInteraction(),
};

export * from "./email-doc-store";
export * from "./email-ui-store";
export * from "./selectors";
