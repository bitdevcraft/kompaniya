"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { MjmlJsonNode } from "../types/ui-component";
import type { ComponentData, PatchEntry } from "./email-doc-store";

import { useEmailDocStore } from "./email-doc-store";
import { useEmailUIStore } from "./email-ui-store";

type ComponentStore = {
  data: ComponentData;
  activeId: UniqueIdentifier | "";
  dragActiveId: UniqueIdentifier | "";
  hoverActiveId: UniqueIdentifier | "";
  past: PatchEntry[];
  future: PatchEntry[];
  setActiveId: (id: UniqueIdentifier | "") => void;
  setDragActiveId: (id: UniqueIdentifier | "") => void;
  setHoverActiveId: (id: UniqueIdentifier | "") => void;
  appendComponent: (
    parentId: UniqueIdentifier,
    tagName: string,
  ) => UniqueIdentifier | null;
  appendChild: (
    parentId: UniqueIdentifier,
    tagName: string,
  ) => UniqueIdentifier | null;
  appendTableWithSize: (
    parentId: UniqueIdentifier,
    rows: number,
    columns: number,
  ) => UniqueIdentifier | null;
  appendTableRow: (tableId: UniqueIdentifier) => void;
  appendTableColumn: (tableId: UniqueIdentifier) => void;
  insertSiblingAfter: (
    id: UniqueIdentifier,
    tagName: string,
  ) => UniqueIdentifier | null;
  moveComponent: (droppableId: UniqueIdentifier, id: UniqueIdentifier) => void;
  duplicateComponent: (
    id: UniqueIdentifier,
    targetParentId?: UniqueIdentifier,
  ) => void;
  removeComponent: (id: UniqueIdentifier) => void;
  setNodeAttribute: (id: UniqueIdentifier, key: string, value: string) => void;
  removeNodeAttribute: (id: UniqueIdentifier, key: string) => void;
  renameNodeAttribute: (
    id: UniqueIdentifier,
    fromKey: string,
    toKey: string,
  ) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
  setHeadDefaults: (id: UniqueIdentifier) => void;
  clearHead: (id: UniqueIdentifier) => void;
  setFromMjmlJson: (root: MjmlJsonNode) => void;
  toMjmlJson: () => MjmlJsonNode | null;
  undo: () => void;
  redo: () => void;
};

export const useComponentStore = create<ComponentStore>()(
  subscribeWithSelector((set) => {
    const docApi = useEmailDocStore.getState();
    const uiApi = useEmailUIStore.getState();

    const actions = {
      setActiveId: uiApi.setActiveId,
      setDragActiveId: uiApi.setDragActiveId,
      setHoverActiveId: uiApi.setHoverActiveId,
      appendComponent: docApi.appendComponent,
      appendChild: docApi.appendChild,
      appendTableWithSize: docApi.appendTableWithSize,
      appendTableRow: docApi.appendTableRow,
      appendTableColumn: docApi.appendTableColumn,
      insertSiblingAfter: docApi.insertSiblingAfter,
      moveComponent: docApi.moveComponent,
      duplicateComponent: docApi.duplicateComponent,
      removeComponent: docApi.removeComponent,
      setNodeAttribute: docApi.setNodeAttribute,
      removeNodeAttribute: docApi.removeNodeAttribute,
      renameNodeAttribute: docApi.renameNodeAttribute,
      setNodeContent: docApi.setNodeContent,
      setHeadDefaults: docApi.setHeadDefaults,
      clearHead: docApi.clearHead,
      setFromMjmlJson: (root: MjmlJsonNode) => {
        docApi.setFromMjmlJson(root);
        uiApi.resetInteraction();
      },
      toMjmlJson: docApi.toMjmlJson,
      undo: docApi.undo,
      redo: docApi.redo,
    } satisfies Omit<
      ComponentStore,
      "data" | "activeId" | "dragActiveId" | "hoverActiveId" | "past" | "future"
    >;

    const buildState = () => {
      const docState = useEmailDocStore.getState();
      const uiState = useEmailUIStore.getState();

      return {
        data: docState.doc,
        activeId: uiState.activeId,
        dragActiveId: uiState.dragActiveId,
        hoverActiveId: uiState.hoverActiveId,
        past: docState.history.past,
        future: docState.history.future,
        ...actions,
      };
    };

    const sync = () => set(buildState(), true);

    useEmailDocStore.subscribe(sync);
    useEmailUIStore.subscribe(sync);

    return buildState();
  }),
);
