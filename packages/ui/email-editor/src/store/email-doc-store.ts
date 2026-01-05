"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import {
  applyPatches,
  enablePatches,
  type Patch,
  produceWithPatches,
} from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import type {
  MjmlAttributes,
  MjmlJsonNode,
  UiComponentConfig,
} from "../types/ui-component";

import { canAcceptChildTag } from "../config/nodes";
import { insertAt } from "../utils/array";
import { buildDefaultHeadNode, DEFAULT_HEAD_NODE } from "../utils/default-head";

enablePatches();

export type ComponentData = Record<UniqueIdentifier, UiComponentConfig>;

export type EmailDocStore = {
  doc: ComponentData;
  history: HistoryState;
  setDoc: (
    doc: ComponentData,
    options?: {
      resetHistory?: boolean;
    },
  ) => void;
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

export type PatchEntry = {
  patches: Patch[];
  inversePatches: Patch[];
};

type HistoryState = {
  past: PatchEntry[];
  future: PatchEntry[];
  maxHistory: number;
};

const MAX_HISTORY = 50;

export const ROOT_ID = "root-canvas" as UniqueIdentifier;
export const ROOT_BODY_ID = "root-body" as UniqueIdentifier;
export const ROOT_HEAD_ID = "root-head" as UniqueIdentifier;

const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

const normalizeRoot = (root: MjmlJsonNode) => {
  let rootAttributes: Record<string, string> = {};
  let headNode: MjmlJsonNode | null = null;
  let bodyNode: MjmlJsonNode | null = null;
  let rootChildren: MjmlJsonNode[] = [];
  const mergeChildren = (
    node: MjmlJsonNode,
    extraChildren: MjmlJsonNode[],
  ): MjmlJsonNode => ({
    tagName: node.tagName,
    attributes: node.attributes ?? {},
    children: [...(node.children ?? []), ...extraChildren],
    ...(node.content !== undefined ? { content: node.content } : {}),
  });

  if (root.tagName === "mjml") {
    rootAttributes = root.attributes ?? {};
    const fallbackBodyChildren: MjmlJsonNode[] = [];
    const fallbackHeadChildren: MjmlJsonNode[] = [];
    let bodyInsertIndex = -1;
    let headInsertIndex = -1;

    (root.children ?? []).forEach((child) => {
      if (child.tagName === "mj-head") {
        if (!headNode) {
          headNode = child;
          rootChildren.push(child);
        } else {
          const currentHead: MjmlJsonNode = headNode ?? buildDefaultHeadNode();
          const mergedHead = mergeChildren(currentHead, child.children ?? []);
          headNode = mergedHead;
          rootChildren = rootChildren.map((existing) =>
            existing.tagName === "mj-head" ? mergedHead : existing,
          );
        }
      } else if (child.tagName === "mj-body") {
        if (!bodyNode) {
          bodyNode = child;
          rootChildren.push(child);
        } else {
          if (canAcceptChildTag("mj-body", child.tagName)) {
            fallbackBodyChildren.push(child);
          }
        }
      } else if (child.tagName === "mj-raw") {
        rootChildren.push(child);
      } else if (canAcceptChildTag("mj-head", child.tagName)) {
        fallbackHeadChildren.push(child);
        if (headInsertIndex === -1) {
          headInsertIndex = rootChildren.length;
        }
      } else if (canAcceptChildTag("mj-body", child.tagName)) {
        fallbackBodyChildren.push(child);
        if (bodyInsertIndex === -1) {
          bodyInsertIndex = rootChildren.length;
        }
      }
    });

    let headInsertedAt: number | null = null;

    if (!headNode) {
      headNode = buildDefaultHeadNode(fallbackHeadChildren);
    } else if (fallbackHeadChildren.length) {
      const currentHead: MjmlJsonNode = headNode ?? buildDefaultHeadNode();
      const mergedHead = mergeChildren(currentHead, fallbackHeadChildren);
      headNode = mergedHead;
      rootChildren = rootChildren.map((child) =>
        child.tagName === "mj-head" ? mergedHead : child,
      );
    }

    if (!rootChildren.some((child) => child.tagName === "mj-head")) {
      const insertIndex = headInsertIndex === -1 ? 0 : headInsertIndex;
      headInsertedAt = insertIndex;
      const ensuredHead =
        headNode ?? buildDefaultHeadNode(fallbackHeadChildren);
      headNode = ensuredHead;
      rootChildren = insertAt(rootChildren, insertIndex, ensuredHead);
    }

    if (!bodyNode) {
      const createdBody: MjmlJsonNode = {
        tagName: "mj-body",
        attributes: {},
        children: fallbackBodyChildren,
      };
      bodyNode = createdBody;
      let insertIndex =
        bodyInsertIndex === -1 ? rootChildren.length : bodyInsertIndex;
      if (headInsertedAt !== null && headInsertedAt <= insertIndex) {
        insertIndex += 1;
      }
      rootChildren = insertAt(rootChildren, insertIndex, createdBody);
    } else if (fallbackBodyChildren.length) {
      const currentBody: MjmlJsonNode = bodyNode ?? {
        tagName: "mj-body",
        attributes: {},
        children: [],
      };
      const mergedBody = mergeChildren(currentBody, fallbackBodyChildren);
      bodyNode = mergedBody;
      rootChildren = rootChildren.map((child) =>
        child.tagName === "mj-body" ? mergedBody : child,
      );
    }
  } else if (root.tagName === "mj-body") {
    const ensuredHead = buildDefaultHeadNode();
    const ensuredBody = root;
    headNode = ensuredHead;
    bodyNode = ensuredBody;
    rootChildren = [ensuredHead, ensuredBody];
  } else {
    const ensuredHead = buildDefaultHeadNode();
    const ensuredBody: MjmlJsonNode = {
      tagName: "mj-body",
      attributes: {},
      children: [root],
    };
    headNode = ensuredHead;
    bodyNode = ensuredBody;
    rootChildren = [ensuredHead, ensuredBody];
  }

  return {
    root: {
      tagName: "mjml",
      attributes: rootAttributes,
      children: rootChildren,
    },
    head: {
      tagName: "mj-head",
      attributes: headNode?.attributes ?? {},
      children: headNode?.children ?? [],
      content: headNode?.content,
    },
    body: {
      tagName: "mj-body",
      attributes: bodyNode?.attributes ?? {},
      children: bodyNode?.children ?? [],
      content: bodyNode?.content,
    },
    rootChildren,
  };
};
const buildTableGrid = (
  rows: number,
  columns: number,
  options: {
    parentId?: UniqueIdentifier;
    includeParentRef?: boolean;
  } = {},
): { id: UniqueIdentifier; data: ComponentData } => {
  const tableId = nanoid() as UniqueIdentifier;
  const rowCount = Math.max(1, rows);
  const colCount = Math.max(1, columns);
  const rowIds: UniqueIdentifier[] = [];
  const data: ComponentData = {};

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowId = nanoid() as UniqueIdentifier;
    rowIds.push(rowId);

    const cellIds: UniqueIdentifier[] = [];
    for (let colIndex = 0; colIndex < colCount; colIndex += 1) {
      const cellId = nanoid() as UniqueIdentifier;
      cellIds.push(cellId);
      data[cellId] = {
        tagName: rowIndex === 0 ? "th" : "td",
        items: [],
        attributes: {},
        content: "",
        parent: rowId,
      };
    }

    data[rowId] = {
      tagName: "tr",
      items: cellIds,
      attributes: {},
      parent: tableId,
    };
  }

  data[tableId] = {
    tagName: "mj-table",
    items: rowIds,
    attributes: {},
    ...(options.includeParentRef && options.parentId
      ? { parent: options.parentId }
      : {}),
  };

  return { id: tableId, data };
};

const buildTableRow = (
  tableId: UniqueIdentifier,
  colCount: number,
  isHeaderRow: boolean,
) => {
  const rowId = nanoid() as UniqueIdentifier;
  const cellIds: UniqueIdentifier[] = [];
  const data: ComponentData = {};

  for (let index = 0; index < Math.max(1, colCount); index += 1) {
    const cellId = nanoid() as UniqueIdentifier;
    cellIds.push(cellId);
    data[cellId] = {
      tagName: isHeaderRow ? "th" : "td",
      items: [],
      attributes: {},
      content: "",
      parent: rowId,
    };
  }

  data[rowId] = {
    tagName: "tr",
    items: cellIds,
    attributes: {},
    parent: tableId,
  };

  return { rowId, data };
};

const buildNodeTree = (
  tagName: string,
  options: {
    parentId?: UniqueIdentifier;
    includeParentRef?: boolean;
  } = {},
): { id: UniqueIdentifier; data: ComponentData } => {
  if (tagName === "mj-table") {
    return buildTableGrid(2, 2, options);
  }

  if (tagName === "tr") {
    const rowId = nanoid() as UniqueIdentifier;
    const cellId = nanoid() as UniqueIdentifier;

    const rowNode: UiComponentConfig = {
      tagName,
      items: [cellId],
      attributes: {},
      ...(options.includeParentRef && options.parentId
        ? { parent: options.parentId }
        : {}),
    };

    const cellNode: UiComponentConfig = {
      tagName: "td",
      items: [],
      attributes: {},
      content: "",
      parent: rowId,
    };

    return {
      id: rowId,
      data: {
        [rowId]: rowNode,
        [cellId]: cellNode,
      },
    };
  }

  if (tagName === "mj-navbar") {
    const navbarId = nanoid() as UniqueIdentifier;
    const linkId = nanoid() as UniqueIdentifier;

    const navbarNode: UiComponentConfig = {
      tagName,
      items: [linkId],
      attributes: {},
      ...(options.includeParentRef && options.parentId
        ? { parent: options.parentId }
        : {}),
    };

    const linkNode: UiComponentConfig = {
      tagName: "mj-navbar-link",
      items: [],
      attributes: {},
      content: "Nav link",
      parent: navbarId,
    };

    return {
      id: navbarId,
      data: {
        [navbarId]: navbarNode,
        [linkId]: linkNode,
      },
    };
  }

  if (tagName === "mj-carousel") {
    const carouselId = nanoid() as UniqueIdentifier;
    const imageId = nanoid() as UniqueIdentifier;

    const carouselNode: UiComponentConfig = {
      tagName,
      items: [imageId],
      attributes: {},
      ...(options.includeParentRef && options.parentId
        ? { parent: options.parentId }
        : {}),
    };

    const imageNode: UiComponentConfig = {
      tagName: "mj-carousel-image",
      items: [],
      attributes: {},
      parent: carouselId,
    };

    return {
      id: carouselId,
      data: {
        [carouselId]: carouselNode,
        [imageId]: imageNode,
      },
    };
  }

  if (tagName === "mj-social") {
    const socialId = nanoid() as UniqueIdentifier;
    const elementId = nanoid() as UniqueIdentifier;

    const socialNode: UiComponentConfig = {
      tagName,
      items: [elementId],
      attributes: {},
      ...(options.includeParentRef && options.parentId
        ? { parent: options.parentId }
        : {}),
    };

    const elementNode: UiComponentConfig = {
      tagName: "mj-social-element",
      items: [],
      attributes: { name: "facebook" },
      content: "Facebook",
      parent: socialId,
    };

    return {
      id: socialId,
      data: {
        [socialId]: socialNode,
        [elementId]: elementNode,
      },
    };
  }

  if (tagName === "mj-accordion-element") {
    const elementId = nanoid() as UniqueIdentifier;
    const titleId = nanoid() as UniqueIdentifier;
    const textId = nanoid() as UniqueIdentifier;

    const elementNode: UiComponentConfig = {
      tagName,
      items: [titleId, textId],
      attributes: {},
      ...(options.includeParentRef && options.parentId
        ? { parent: options.parentId }
        : {}),
    };

    const titleNode: UiComponentConfig = {
      tagName: "mj-accordion-title",
      items: [],
      attributes: {},
      content: "Accordion title",
      parent: elementId,
    };

    const textNode: UiComponentConfig = {
      tagName: "mj-accordion-text",
      items: [],
      attributes: {},
      content: "Accordion content",
      parent: elementId,
    };

    return {
      id: elementId,
      data: {
        [elementId]: elementNode,
        [titleId]: titleNode,
        [textId]: textNode,
      },
    };
  }

  const id = nanoid() as UniqueIdentifier;
  const defaultAttributes: MjmlAttributes =
    tagName === "mj-spacer"
      ? { height: "20px" }
      : tagName === "mj-social-element"
        ? { name: "facebook" }
        : tagName === "mj-section"
          ? { "full-width": "full-width" }
          : {};
  const defaultContent =
    tagName === "mj-text"
      ? ""
      : tagName === "mj-button"
        ? "Button"
        : tagName === "mj-navbar-link"
          ? "Nav link"
          : tagName === "td" || tagName === "th"
            ? ""
            : tagName === "mj-accordion-title"
              ? "Accordion title"
              : tagName === "mj-accordion-text"
                ? "Accordion content"
                : tagName === "mj-social-element"
                  ? "Facebook"
                  : undefined;

  const newNode: UiComponentConfig = {
    tagName,
    items: [],
    attributes: defaultAttributes,
    ...(defaultContent !== undefined ? { content: defaultContent } : {}),
    ...(options.includeParentRef && options.parentId
      ? { parent: options.parentId }
      : {}),
  };

  return {
    id,
    data: {
      [id]: newNode,
    },
  };
};
const duplicateTree = (
  data: ComponentData,
  sourceId: UniqueIdentifier,
  idMap: Record<string, UniqueIdentifier> = {},
): {
  newData: ComponentData;
  newId: UniqueIdentifier;
} => {
  const source = data[sourceId];
  if (!source) throw new Error(`Component ${sourceId} not found`);

  const newId = nanoid() as UniqueIdentifier;
  idMap[sourceId] = newId;

  let clonedData: ComponentData = {};
  const newItems: UniqueIdentifier[] = [];

  for (const childId of source.items) {
    const { newData: childData, newId: childNewId } = duplicateTree(
      data,
      childId,
      idMap,
    );
    clonedData = { ...clonedData, ...childData };
    newItems.push(childNewId);
  }

  const clonedNode: UiComponentConfig = {
    tagName: source.tagName,
    items: newItems,
    attributes: { ...(source.attributes ?? {}) },
    content: source.content,
  };
  clonedData[newId] = clonedNode;

  return { newData: clonedData, newId };
};

const parseDroppable = (droppableId: string) => {
  const parts = droppableId.split("|");
  if (parts.length === 3) {
    return {
      parentId: parts[1] as UniqueIdentifier,
      index: Number(parts[2]),
      isSort: true,
    };
  }
  return {
    parentId: droppableId as UniqueIdentifier,
    index: 0,
    isSort: false,
  };
};

const buildFromMjmlJson = (
  node: MjmlJsonNode,
  id: UniqueIdentifier,
  parentId?: UniqueIdentifier,
): ComponentData => {
  const childIds: UniqueIdentifier[] = [];
  let data: ComponentData = {};

  if (node.children?.length) {
    for (const child of node.children) {
      const childId = nanoid() as UniqueIdentifier;
      data = {
        ...data,
        ...buildFromMjmlJson(child, childId, id),
      };
      childIds.push(childId);
    }
  }

  data[id] = {
    tagName: node.tagName,
    items: childIds,
    attributes: node.attributes ?? {},
    content: node.children?.length ? undefined : node.content,
    ...(parentId ? { parent: parentId } : {}),
  };

  return data;
};

const replaceSubtree = (
  data: ComponentData,
  rootId: UniqueIdentifier,
  rootNode: MjmlJsonNode,
) => {
  const existing = data[rootId];
  if (!existing) return false;

  const idsToDelete = new Set<UniqueIdentifier>();
  const collect = (currentId: UniqueIdentifier) => {
    const current = data[currentId];
    if (!current) return;
    idsToDelete.add(currentId);
    current.items.forEach(collect);
  };

  collect(rootId);

  const parentId = existing.parent;
  const newData = buildFromMjmlJson(rootNode, rootId, parentId);

  idsToDelete.forEach((id) => {
    if (!(id in newData)) {
      delete data[id];
    }
  });

  Object.entries(newData).forEach(([id, node]) => {
    data[id as UniqueIdentifier] = node;
  });

  return true;
};

const defaultHeadData = buildFromMjmlJson(
  DEFAULT_HEAD_NODE,
  ROOT_HEAD_ID,
  ROOT_ID,
);

const devtoolsOptions = {
  name: "EmailDocStore",
  enabled: process.env.NODE_ENV === "development",
};

export const useEmailDocStore = create<EmailDocStore>()(
  devtools(
    subscribeWithSelector((set, get) => {
      const commitDoc = <T>(
        recipe: (draft: ComponentData) => T | void,
      ): { result: T | undefined; didCommit: boolean } => {
        const { doc } = get();
        let result: T | undefined;
        const [nextDoc, patches, inversePatches] = produceWithPatches(
          doc,
          (draft) => {
            result = recipe(draft) as T;
          },
        );

        if (patches.length === 0) {
          return { result, didCommit: false };
        }

        const entry: PatchEntry = { patches, inversePatches };

        set((state) => {
          const past = [...state.history.past, entry];
          if (past.length > state.history.maxHistory) {
            past.shift();
          }

          return {
            doc: nextDoc,
            history: {
              ...state.history,
              past,
              future: [],
            },
          };
        });

        return { result, didCommit: true };
      };

      const replaceDoc = (
        nextDoc: ComponentData,
        options?: { resetHistory?: boolean },
      ) => {
        const shouldReset = options?.resetHistory ?? true;

        set((state) => ({
          doc: nextDoc,
          history: shouldReset
            ? { ...state.history, past: [], future: [] }
            : state.history,
        }));
      };

      return {
        doc: {
          [ROOT_ID]: {
            tagName: "mjml",
            items: [ROOT_HEAD_ID, ROOT_BODY_ID],
            attributes: {},
          },
          ...defaultHeadData,
          [ROOT_BODY_ID]: {
            tagName: "mj-body",
            items: [],
            attributes: {},
            parent: ROOT_ID,
          },
        },
        history: {
          past: [],
          future: [],
          maxHistory: MAX_HISTORY,
        },
        setDoc: (doc, options) => {
          replaceDoc(doc, options);
        },
        appendComponent: (parentId, tagName) => {
          let createdId: UniqueIdentifier | null = null;

          commitDoc((draft) => {
            const targetParentId =
              parentId === ROOT_ID ? ROOT_BODY_ID : parentId;
            const parent = draft[targetParentId];
            if (!parent) return;
            if (!canAcceptChildTag(parent.tagName, tagName)) return;

            const { id, data: newNodes } = buildNodeTree(tagName, {
              parentId: targetParentId,
              includeParentRef: false,
            });
            createdId = id;

            Object.entries(newNodes).forEach(([nodeId, node]) => {
              draft[nodeId as UniqueIdentifier] = node;
            });
            parent.items = uniq([...parent.items, id]);
          });

          return createdId;
        },
        appendChild: (parentId, tagName) => {
          let createdId: UniqueIdentifier | null = null;

          commitDoc((draft) => {
            const targetParentId =
              parentId === ROOT_ID ? ROOT_BODY_ID : parentId;
            const parent = draft[targetParentId];
            if (!parent) return;
            if (!canAcceptChildTag(parent.tagName, tagName)) return;

            const { id, data: newNodes } = buildNodeTree(tagName, {
              parentId: targetParentId,
              includeParentRef: true,
            });
            createdId = id;

            Object.entries(newNodes).forEach(([nodeId, node]) => {
              draft[nodeId as UniqueIdentifier] = node;
            });
            parent.items = uniq([...parent.items, id]);
          });

          return createdId;
        },
        appendTableWithSize: (parentId, rows, columns) => {
          let createdId: UniqueIdentifier | null = null;

          commitDoc((draft) => {
            const targetParentId =
              parentId === ROOT_ID ? ROOT_BODY_ID : parentId;
            const parent = draft[targetParentId];
            if (!parent) return;
            if (!canAcceptChildTag(parent.tagName, "mj-table")) return;

            const { id, data: newNodes } = buildTableGrid(rows, columns, {
              parentId: targetParentId,
              includeParentRef: true,
            });
            createdId = id;

            Object.entries(newNodes).forEach(([nodeId, node]) => {
              draft[nodeId as UniqueIdentifier] = node;
            });

            parent.items = uniq([...parent.items, id]);
          });

          return createdId;
        },
        appendTableRow: (tableId) => {
          commitDoc((draft) => {
            const table = draft[tableId];
            if (!table || table.tagName !== "mj-table") return;

            const rowIds = table.items;
            const colCount =
              rowIds.length > 0
                ? Math.max(
                    ...rowIds.map((rowId) => draft[rowId]?.items.length ?? 0),
                  )
                : 1;
            const isHeaderRow = rowIds.length === 0;
            const { rowId, data: newNodes } = buildTableRow(
              tableId,
              colCount,
              isHeaderRow,
            );

            Object.entries(newNodes).forEach(([nodeId, node]) => {
              draft[nodeId as UniqueIdentifier] = node;
            });

            table.items = uniq([...table.items, rowId]);
          });
        },
        appendTableColumn: (tableId) => {
          commitDoc((draft) => {
            const table = draft[tableId];
            if (!table || table.tagName !== "mj-table") return;

            table.items.forEach((rowId, rowIndex) => {
              const row = draft[rowId];
              if (!row) return;

              const firstCellId = row.items[0];
              const firstCell = firstCellId ? draft[firstCellId] : null;
              const cellTag =
                firstCell?.tagName === "th" || (!firstCell && rowIndex === 0)
                  ? "th"
                  : "td";
              const newCellId = nanoid() as UniqueIdentifier;

              draft[newCellId] = {
                tagName: cellTag,
                items: [],
                attributes: {},
                content: "",
                parent: rowId,
              };

              row.items = uniq([...row.items, newCellId]);
            });
          });
        },
        insertSiblingAfter: (id, tagName) => {
          let newId: UniqueIdentifier | null = null;

          commitDoc((draft) => {
            const node = draft[id];
            if (!node?.parent) return;

            const parentId = node.parent;
            const parent = draft[parentId];
            if (!parent) return;
            if (!canAcceptChildTag(parent.tagName, tagName)) return;

            const { id: createdId, data: newNodes } = buildNodeTree(tagName, {
              parentId,
              includeParentRef: true,
            });

            const insertIndex = Math.max(
              parent.items.findIndex((item) => item === id) + 1,
              parent.items.length,
            );
            parent.items = uniq(insertAt(parent.items, insertIndex, createdId));

            Object.entries(newNodes).forEach(([nodeId, nodeData]) => {
              draft[nodeId as UniqueIdentifier] = nodeData;
            });

            newId = createdId;
          });

          return newId;
        },
        moveComponent: (droppableId, id) => {
          commitDoc((draft) => {
            if (id === ROOT_BODY_ID || id === ROOT_HEAD_ID) return;

            const {
              parentId: destParentId,
              index: destIndex,
              isSort,
            } = parseDroppable(String(droppableId));
            const targetParentId =
              destParentId === ROOT_ID ? ROOT_BODY_ID : destParentId;
            const targetIndex =
              destParentId === ROOT_ID
                ? (draft[ROOT_BODY_ID]?.items.length ?? 0)
                : destIndex;

            const component = draft[id];
            if (!component?.parent) return;

            const srcParentId = component.parent;
            const srcParent = draft[srcParentId];
            if (!srcParent) return;

            const destParent = draft[targetParentId];
            if (!destParent) return;
            if (
              srcParentId !== targetParentId &&
              !canAcceptChildTag(destParent.tagName, component.tagName)
            ) {
              return;
            }

            if (srcParentId === targetParentId) {
              if (!isSort) return;
              const oldIdx = destParent.items.findIndex((item) => item === id);
              const newIdx = Math.min(destIndex, destParent.items.length - 1);
              if (oldIdx === newIdx) return;

              const newArr = arrayMove(destParent.items, oldIdx, newIdx);

              destParent.items = uniq(newArr);
              component.parent = targetParentId;
              return;
            }

            srcParent.items = srcParent.items.filter(
              (childId) => childId !== id,
            );
            destParent.items = uniq(
              insertAt(destParent.items, targetIndex, id),
            );
            component.parent = targetParentId;
          });
        },
        duplicateComponent: (id, targetParentId) => {
          commitDoc((draft) => {
            if (id === ROOT_ID || id === ROOT_BODY_ID || id === ROOT_HEAD_ID) {
              return;
            }

            const src = draft[id];
            if (!src) return;

            const parentId = targetParentId ?? src.parent;
            if (!parentId) return;
            if (parentId === ROOT_ID) return;

            const dest = draft[parentId];
            if (!dest) return;
            if (!canAcceptChildTag(dest.tagName, src.tagName)) return;

            const { newData, newId } = duplicateTree(draft, id);

            const srcIndex = dest.items.findIndex((item) => item === id);
            const updatedDestItems = uniq(
              insertAt(dest.items, srcIndex + 1, newId),
            );

            Object.entries(newData).forEach(([nodeId, node]) => {
              draft[nodeId as UniqueIdentifier] = node;
            });

            const clonedRoot = draft[newId];
            if (!clonedRoot) return;

            clonedRoot.parent = parentId;
            dest.items = updatedDestItems;
          });
        },
        removeComponent: (id) => {
          commitDoc((draft) => {
            if (id === ROOT_ID || id === ROOT_BODY_ID || id === ROOT_HEAD_ID) {
              return;
            }

            const node = draft[id];
            if (!node) return;

            const idsToDelete = new Set<UniqueIdentifier>();
            const collect = (currentId: UniqueIdentifier) => {
              const current = draft[currentId];
              if (!current) return;
              idsToDelete.add(currentId);
              current.items.forEach(collect);
            };

            collect(id);

            idsToDelete.forEach((key) => {
              delete draft[key];
            });

            const parentId = node.parent;
            const parentNode = parentId ? draft[parentId] : undefined;
            if (parentId && parentNode) {
              parentNode.items = parentNode.items.filter(
                (childId) => childId !== id,
              );
            }
          });
        },
        setNodeAttribute: (id, key, value) => {
          commitDoc((draft) => {
            const node = draft[id];
            if (!node) return;

            if (node.attributes?.[key] === value) return;

            if (!node.attributes) {
              node.attributes = {};
            }

            node.attributes[key] = value;
          });
        },
        removeNodeAttribute: (id, key) => {
          commitDoc((draft) => {
            const node = draft[id];
            if (!node || !node.attributes || !(key in node.attributes)) return;

            delete node.attributes[key];
          });
        },
        renameNodeAttribute: (id, fromKey, toKey) => {
          const trimmed = toKey.trim();
          if (!trimmed || trimmed === fromKey) return;

          commitDoc((draft) => {
            const node = draft[id];
            if (!node) return;

            const currentAttributes = node.attributes ?? {};
            const value = currentAttributes[fromKey];
            if (value === undefined) return;

            delete currentAttributes[fromKey];
            currentAttributes[trimmed] = value;
            node.attributes = currentAttributes;
          });
        },
        setNodeContent: (id, content) => {
          commitDoc((draft) => {
            const node = draft[id];
            if (!node) return;
            if (node.content === content) return;

            node.content = content;
          });
        },
        setHeadDefaults: (id) => {
          commitDoc((draft) => {
            const node = draft[id];
            if (!node || node.tagName !== "mj-head") return;
            replaceSubtree(draft, id, buildDefaultHeadNode());
          });
        },
        clearHead: (id) => {
          commitDoc((draft) => {
            const node = draft[id];
            if (!node || node.tagName !== "mj-head") return;
            replaceSubtree(draft, id, {
              tagName: "mj-head",
              attributes: node.attributes ?? {},
              children: [],
            });
          });
        },
        setFromMjmlJson: (root) => {
          const normalized = normalizeRoot(root);
          let data: ComponentData = {};
          const headData = buildFromMjmlJson(
            normalized.head,
            ROOT_HEAD_ID,
            ROOT_ID,
          );
          const bodyData = buildFromMjmlJson(
            normalized.body,
            ROOT_BODY_ID,
            ROOT_ID,
          );
          data = { ...data, ...headData, ...bodyData };

          const rootItems: UniqueIdentifier[] = [];
          const orderedRootChildren =
            normalized.rootChildren ?? normalized.root.children ?? [];

          orderedRootChildren.forEach((child) => {
            if (child.tagName === "mj-head") {
              rootItems.push(ROOT_HEAD_ID);
              return;
            }

            if (child.tagName === "mj-body") {
              rootItems.push(ROOT_BODY_ID);
              return;
            }

            const childId = nanoid() as UniqueIdentifier;
            data = {
              ...data,
              ...buildFromMjmlJson(child, childId, ROOT_ID),
            };
            rootItems.push(childId);
          });

          if (!rootItems.includes(ROOT_BODY_ID)) {
            rootItems.push(ROOT_BODY_ID);
          }

          if (!rootItems.includes(ROOT_HEAD_ID)) {
            rootItems.unshift(ROOT_HEAD_ID);
          }

          data[ROOT_ID] = {
            tagName: "mjml",
            items: rootItems,
            attributes: normalized.root.attributes ?? {},
          };

          replaceDoc(data, { resetHistory: true });
        },
        undo: () => {
          set((state) => {
            if (state.history.past.length === 0) return state;
            const previous = state.history.past[state.history.past.length - 1];
            if (!previous) return state;
            const nextPast = state.history.past.slice(0, -1);
            const nextFuture = [previous, ...state.history.future];

            return {
              doc: applyPatches(state.doc, previous.inversePatches),
              history: {
                ...state.history,
                past: nextPast,
                future: nextFuture,
              },
            };
          });
        },
        redo: () => {
          set((state) => {
            if (state.history.future.length === 0) return state;
            const [next, ...rest] = state.history.future;
            if (!next) return state;

            const past = [...state.history.past, next];
            if (past.length > state.history.maxHistory) {
              past.shift();
            }

            return {
              doc: applyPatches(state.doc, next.patches),
              history: {
                ...state.history,
                past,
                future: rest,
              },
            };
          });
        },
        toMjmlJson: () => {
          const data = get().doc;
          if (!data[ROOT_ID]) {
            return {
              tagName: "mjml",
              attributes: {},
              children: [
                {
                  tagName: "mj-head",
                  attributes: {},
                  children: [],
                },
                {
                  tagName: "mj-body",
                  attributes: {},
                  children: [],
                },
              ],
            };
          }

          const build = (id: UniqueIdentifier): MjmlJsonNode | null => {
            const node = data[id];
            if (!node) return null;

            const children = node.items
              .map((childId) => build(childId))
              .filter((child): child is MjmlJsonNode => Boolean(child));

            if (children.length > 0) {
              return {
                tagName: node.tagName,
                attributes: node.attributes ?? {},
                children,
              };
            }

            const result: MjmlJsonNode = {
              tagName: node.tagName,
              attributes: node.attributes ?? {},
            };

            if (node.content !== undefined) {
              result.content = node.content;
            }

            return result;
          };

          const rootNode = data[ROOT_ID];
          const rootItems = rootNode?.items ?? [];
          const children = rootItems
            .map((id) => build(id))
            .filter((child): child is MjmlJsonNode => Boolean(child));

          const hasHead = children.some((child) => child.tagName === "mj-head");
          if (!hasHead) {
            const fallbackHead = build(ROOT_HEAD_ID);
            if (fallbackHead && fallbackHead.tagName === "mj-head") {
              children.unshift(fallbackHead);
            } else {
              children.unshift({
                tagName: "mj-head",
                attributes: {},
                children: [],
              });
            }
          }

          const hasBody = children.some((child) => child.tagName === "mj-body");
          if (!hasBody) {
            const fallbackBody = build(ROOT_BODY_ID);
            if (fallbackBody && fallbackBody.tagName === "mj-body") {
              children.push(fallbackBody);
            } else {
              children.push({
                tagName: "mj-body",
                attributes: {},
                children: [],
              });
            }
          }

          return {
            tagName: "mjml",
            attributes: rootNode?.attributes ?? {},
            children,
          };
        },
      };
    }),
    devtoolsOptions,
  ),
);
