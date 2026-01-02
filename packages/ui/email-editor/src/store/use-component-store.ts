import { UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { create } from "zustand";

import { canAcceptChildTag } from "../config/nodes";
import {
  MjmlAttributes,
  MjmlJsonNode,
  UiComponentConfig,
} from "../types/ui-component";
import { insertAt } from "../utils/array";
import { buildDefaultHeadNode, DEFAULT_HEAD_NODE } from "../utils/default-head";

type ComponentData = Record<UniqueIdentifier, UiComponentConfig>;

type HistoryEntry = {
  data: ComponentData;
  activeId: UniqueIdentifier;
};

const MAX_HISTORY = 50;

const ROOT_ID = "root-canvas" as UniqueIdentifier;
const ROOT_BODY_ID = "root-body" as UniqueIdentifier;
const ROOT_HEAD_ID = "root-head" as UniqueIdentifier;

interface ComponentStore {
  data: ComponentData;
  activeId: UniqueIdentifier;
  dragActiveId: UniqueIdentifier;
  hoverActiveId: UniqueIdentifier;
  past: HistoryEntry[];
  future: HistoryEntry[];
  setActiveId: (id: UniqueIdentifier) => void;
  setDragActiveId: (id: UniqueIdentifier) => void;
  setHoverActiveId: (id: UniqueIdentifier) => void;
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
}

export const useComponentStore = create<ComponentStore>((set, get) => {
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
            const currentHead: MjmlJsonNode =
              headNode ?? buildDefaultHeadNode();
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

  const createAndAttach = (
    data: ComponentData,
    parentId: UniqueIdentifier,
    tagName: string,
    includeParentRef: boolean,
  ) => {
    const parent = data[parentId];

    if (!parent) return { data, id: null };

    const { id, data: newNodes } = buildNodeTree(tagName, {
      parentId,
      includeParentRef,
    });

    return {
      data: {
        ...data,
        ...newNodes,
        [parentId]: {
          ...parent,
          items: uniq([...parent.items, id]),
        },
      },
      id,
    };
  };

  function duplicateTree(
    data: ComponentData,
    sourceId: UniqueIdentifier,
    idMap: Record<string, UniqueIdentifier> = {},
  ): {
    newData: ComponentData;
    newId: UniqueIdentifier;
  } {
    const source = data[sourceId];
    if (!source) throw new Error(`Component ${sourceId} not found`);

    const newId = nanoid() as UniqueIdentifier;
    idMap[sourceId] = newId;

    // clone children recursively
    let clonedData: ComponentData = {};
    const newItems: UniqueIdentifier[] = [];

    for (const childId of source.items) {
      const { newData: childData, newId: childNewId } = duplicateTree(
        data,
        childId,
        idMap,
      );
      // merge child subtree
      clonedData = { ...clonedData, ...childData };
      newItems.push(childNewId);
    }

    // clone this node
    const clonedNode: UiComponentConfig = {
      tagName: source.tagName,
      items: newItems,
      attributes: { ...(source.attributes ?? {}) },
      content: source.content,
      // parent will be set by caller
    };
    clonedData[newId] = clonedNode;

    return { newData: clonedData, newId };
  }

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
    state: ComponentStore,
    rootId: UniqueIdentifier,
    rootNode: MjmlJsonNode,
  ) => {
    const existing = state.data[rootId];
    if (!existing) return state;

    const idsToDelete = new Set<UniqueIdentifier>();
    const collect = (currentId: UniqueIdentifier) => {
      const current = state.data[currentId];
      if (!current) return;
      idsToDelete.add(currentId);
      current.items.forEach(collect);
    };

    collect(rootId);

    const parentId = existing.parent;
    const newData = buildFromMjmlJson(rootNode, rootId, parentId);
    const nextData: ComponentData = { ...state.data, ...newData };

    idsToDelete.forEach((id) => {
      if (!(id in newData)) {
        delete nextData[id];
      }
    });

    return commit(state, nextData);
  };

  const defaultHeadData = buildFromMjmlJson(
    DEFAULT_HEAD_NODE,
    ROOT_HEAD_ID,
    ROOT_ID,
  );

  const commit = (
    state: ComponentStore,
    nextData: ComponentData,
    overrides: Partial<ComponentStore> = {},
  ) => {
    const shouldRecord = nextData !== state.data;
    if (!shouldRecord && Object.keys(overrides).length === 0) {
      return state;
    }

    if (!shouldRecord) {
      return {
        ...state,
        ...overrides,
      };
    }

    const past = [
      ...state.past,
      { data: state.data, activeId: state.activeId },
    ];
    if (past.length > MAX_HISTORY) {
      past.shift();
    }

    return {
      ...state,
      ...overrides,
      data: nextData,
      past,
      future: [],
    };
  };

  return {
    // start with a single "root" container
    data: {
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
    activeId: "",
    dragActiveId: "",
    hoverActiveId: "",
    past: [],
    future: [],
    setActiveId: (id) => {
      set((state) => ({
        ...state,
        activeId: id,
      }));
    },
    setDragActiveId: (id) => {
      set((state) => ({
        ...state,
        dragActiveId: id,
      }));
    },
    setHoverActiveId: (id) => {
      set((state) => ({
        ...state,
        hoverActiveId: id,
      }));
    },
    appendComponent: (parentId, tagName) => {
      let createdId: UniqueIdentifier | null = null;
      set((state) => {
        const targetParentId = parentId === ROOT_ID ? ROOT_BODY_ID : parentId;
        const parent = state.data[targetParentId];
        if (!parent) return state;
        if (!canAcceptChildTag(parent.tagName, tagName)) return state;
        const { data, id } = createAndAttach(
          state.data,
          targetParentId,
          tagName,
          false,
        );
        createdId = id;
        return commit(state, data);
      });
      return createdId;
    },

    appendChild: (parentId, tagName) => {
      let createdId: UniqueIdentifier | null = null;
      set((state) => {
        const targetParentId = parentId === ROOT_ID ? ROOT_BODY_ID : parentId;
        const parent = state.data[targetParentId];
        if (!parent) return state;
        if (!canAcceptChildTag(parent.tagName, tagName)) return state;
        const { data, id } = createAndAttach(
          state.data,
          targetParentId,
          tagName,
          true,
        );
        createdId = id;
        return commit(state, data);
      });
      return createdId;
    },
    appendTableWithSize: (parentId, rows, columns) => {
      let createdId: UniqueIdentifier | null = null;
      set((state) => {
        const targetParentId = parentId === ROOT_ID ? ROOT_BODY_ID : parentId;
        const parent = state.data[targetParentId];
        if (!parent) return state;
        if (!canAcceptChildTag(parent.tagName, "mj-table")) return state;

        const { id, data: newNodes } = buildTableGrid(rows, columns, {
          parentId: targetParentId,
          includeParentRef: true,
        });
        createdId = id;

        const nextData: ComponentData = {
          ...state.data,
          ...newNodes,
          [targetParentId]: {
            ...parent,
            items: uniq([...parent.items, id]),
          },
        };

        return commit(state, nextData);
      });

      return createdId;
    },
    appendTableRow: (tableId) => {
      set((state) => {
        const table = state.data[tableId];
        if (!table || table.tagName !== "mj-table") return state;

        const rowIds = table.items;
        const colCount =
          rowIds.length > 0
            ? Math.max(
                ...rowIds.map((rowId) => state.data[rowId]?.items.length ?? 0),
              )
            : 1;
        const isHeaderRow = rowIds.length === 0;
        const { rowId, data: newNodes } = buildTableRow(
          tableId,
          colCount,
          isHeaderRow,
        );

        const nextData: ComponentData = {
          ...state.data,
          ...newNodes,
          [tableId]: {
            ...table,
            items: uniq([...table.items, rowId]),
          },
        };

        return commit(state, nextData);
      });
    },
    appendTableColumn: (tableId) => {
      set((state) => {
        const table = state.data[tableId];
        if (!table || table.tagName !== "mj-table") return state;

        const nextData: ComponentData = { ...state.data };

        table.items.forEach((rowId, rowIndex) => {
          const row = nextData[rowId];
          if (!row) return;

          const firstCellId = row.items[0];
          const firstCell = firstCellId ? nextData[firstCellId] : null;
          const cellTag =
            firstCell?.tagName === "th" || (!firstCell && rowIndex === 0)
              ? "th"
              : "td";
          const newCellId = nanoid() as UniqueIdentifier;

          nextData[newCellId] = {
            tagName: cellTag,
            items: [],
            attributes: {},
            content: "",
            parent: rowId,
          };

          nextData[rowId] = {
            ...row,
            items: uniq([...row.items, newCellId]),
          };
        });

        return commit(state, nextData);
      });
    },
    insertSiblingAfter: (id, tagName) => {
      const state = get();
      const node = state.data[id];
      if (!node?.parent) return null;

      const parentId = node.parent;
      const parent = state.data[parentId];
      if (!parent) return null;
      if (!canAcceptChildTag(parent.tagName, tagName)) return null;

      const { id: newId, data: newNodes } = buildNodeTree(tagName, {
        parentId,
        includeParentRef: true,
      });

      const insertIndex = Math.max(
        parent.items.findIndex((item) => item === id) + 1,
        parent.items.length,
      );
      const updatedItems = uniq(insertAt(parent.items, insertIndex, newId));

      const nextData: ComponentData = {
        ...state.data,
        ...newNodes,
        [parentId]: {
          ...parent,
          items: updatedItems,
        },
      };

      set((current) => commit(current, nextData));

      return newId;
    },
    setNodeAttribute: (id, key, value) => {
      set((state) => {
        const node = state.data[id];
        if (!node) return state;
        if (node.attributes?.[key] === value) return state;

        const nextData: ComponentData = {
          ...state.data,
          [id]: {
            ...node,
            attributes: {
              ...(node.attributes ?? {}),
              [key]: value,
            },
          },
        };

        return commit(state, nextData);
      });
    },
    removeNodeAttribute: (id, key) => {
      set((state) => {
        const node = state.data[id];
        if (!node) return state;
        if (!node.attributes || !(key in node.attributes)) return state;

        const { [key]: removed, ...rest } = node.attributes ?? {};
        const nextData: ComponentData = {
          ...state.data,
          [id]: {
            ...node,
            attributes: rest,
          },
        };

        return commit(state, nextData);
      });
    },
    renameNodeAttribute: (id, fromKey, toKey) => {
      const trimmed = toKey.trim();
      if (!trimmed || trimmed === fromKey) return;

      set((state) => {
        const node = state.data[id];
        if (!node) return state;

        const currentAttributes = node.attributes ?? {};
        const value = currentAttributes[fromKey];
        if (value === undefined) return state;

        const { [fromKey]: _removed, ...rest } = currentAttributes;
        const nextAttributes: MjmlAttributes = {
          ...rest,
          [trimmed]: value,
        };
        const nextData: ComponentData = {
          ...state.data,
          [id]: {
            ...node,
            attributes: nextAttributes,
          },
        };

        return commit(state, nextData);
      });
    },
    moveComponent: (droppableId, id) => {
      set((state) => {
        if (id === ROOT_BODY_ID || id === ROOT_HEAD_ID) return state;

        const { data } = state;

        const {
          parentId: destParentId,
          index: destIndex,
          isSort,
        } = parseDroppable(String(droppableId));
        const targetParentId =
          destParentId === ROOT_ID ? ROOT_BODY_ID : destParentId;
        const targetIndex =
          destParentId === ROOT_ID
            ? (data[ROOT_BODY_ID]?.items.length ?? 0)
            : destIndex;

        const component = state.data[id];
        if (!component?.parent) return state;

        const srcParentId = component.parent;

        const srcParent = state.data[srcParentId];
        if (!srcParent) return state;

        const destParent = state.data[targetParentId];
        if (!destParent) return state;
        if (
          srcParentId !== targetParentId &&
          !canAcceptChildTag(destParent.tagName, component.tagName)
        ) {
          return state;
        }

        if (srcParentId === targetParentId) {
          if (!isSort) return state;
          const oldIdx = destParent.items.findIndex((item) => item === id);
          const newIdx = isSort
            ? Math.min(destIndex, destParent.items.length - 1)
            : destParent.items.length;
          if (oldIdx === newIdx) return state;

          const newArr = isSort
            ? arrayMove(destParent.items, oldIdx, newIdx)
            : destParent.items;

          const nextData: ComponentData = {
            ...data,
            [targetParentId]: {
              ...destParent,
              items: [...new Set(newArr)],
            },
            [id]: {
              ...component,
              parent: targetParentId,
            },
          };

          return commit(state, nextData);
        }

        const nextData: ComponentData = {
          ...data,
          [srcParentId]: {
            ...srcParent,
            items: srcParent.items.filter((childId) => childId !== id),
          },
          [targetParentId]: {
            ...destParent,
            items: [...new Set(insertAt(destParent.items, targetIndex, id))],
          },
          [id]: {
            ...component,
            parent: targetParentId,
          },
        };

        return commit(state, nextData);
      });
    },
    duplicateComponent: (id, targetParentId) => {
      set((state) => {
        if (id === ROOT_ID || id === ROOT_BODY_ID || id === ROOT_HEAD_ID) {
          return state;
        }

        const src = state.data[id];
        if (!src) return state;

        const parentId = targetParentId ?? src.parent;
        if (!parentId) return state;
        if (parentId === ROOT_ID) return state;

        // clone subtree
        const { newData, newId } = duplicateTree(state.data, id);

        // attach cloned root under parent
        const dest = state.data[parentId];

        if (!dest) return state;
        if (!canAcceptChildTag(dest.tagName, src.tagName)) return state;

        const srcIndex = dest.items.findIndex((item) => item === id);

        // const updatedDestItems = uniq([...dest.items, newId]);
        const updatedDestItems = uniq(
          insertAt(dest.items, srcIndex + 1, newId),
        );
        const clonedRoot = newData[newId];
        if (!clonedRoot) return state;

        const nextData: ComponentData = {
          ...state.data,
          ...newData,
          [parentId]: {
            ...dest,
            items: updatedDestItems,
          },
          // set parent on cloned root
          [newId]: {
            ...clonedRoot,
            parent: parentId,
          },
        };

        return commit(state, nextData);
      });
    },
    removeComponent: (id) => {
      set((state) => {
        if (id === ROOT_ID || id === ROOT_BODY_ID || id === ROOT_HEAD_ID) {
          return state;
        }

        const node = state.data[id];
        if (!node) return state;

        const idsToDelete = new Set<UniqueIdentifier>();
        const collect = (currentId: UniqueIdentifier) => {
          const current = state.data[currentId];
          if (!current) return;
          idsToDelete.add(currentId);
          current.items.forEach(collect);
        };

        collect(id);

        const nextData = { ...state.data };
        idsToDelete.forEach((key) => {
          delete nextData[key];
        });

        const parentId = node.parent;
        const parentNode = parentId ? nextData[parentId] : undefined;
        if (parentId && parentNode) {
          nextData[parentId] = {
            ...parentNode,
            items: parentNode.items.filter((childId) => childId !== id),
          };
        }

        return commit(state, nextData, {
          activeId: idsToDelete.has(state.activeId) ? "" : state.activeId,
          hoverActiveId: idsToDelete.has(state.hoverActiveId)
            ? ""
            : state.hoverActiveId,
          dragActiveId: idsToDelete.has(state.dragActiveId)
            ? ""
            : state.dragActiveId,
        });
      });
    },
    setNodeContent: (id, content) => {
      set((state) => {
        const node = state.data[id];
        if (!node) return state;
        if (node.content === content) return state;

        const nextData: ComponentData = {
          ...state.data,
          [id]: {
            ...node,
            content,
          },
        };

        return commit(state, nextData);
      });
    },
    setHeadDefaults: (id) => {
      set((state) => {
        const node = state.data[id];
        if (!node || node.tagName !== "mj-head") return state;
        return replaceSubtree(state, id, buildDefaultHeadNode());
      });
    },
    clearHead: (id) => {
      set((state) => {
        const node = state.data[id];
        if (!node || node.tagName !== "mj-head") return state;
        return replaceSubtree(state, id, {
          tagName: "mj-head",
          attributes: node.attributes ?? {},
          children: [],
        });
      });
    },
    setFromMjmlJson: (root) => {
      set((state) => {
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
        return {
          ...state,
          data,
          activeId: "",
          dragActiveId: "",
          hoverActiveId: "",
          past: [],
          future: [],
        };
      });
    },
    undo: () => {
      set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        if (!previous) return state;
        const nextPast = state.past.slice(0, -1);
        const nextFuture = [
          { data: state.data, activeId: state.activeId },
          ...state.future,
        ];

        return {
          ...state,
          data: previous.data,
          activeId: previous.activeId,
          dragActiveId: "",
          hoverActiveId: "",
          past: nextPast,
          future: nextFuture,
        };
      });
    },
    redo: () => {
      set((state) => {
        if (state.future.length === 0) return state;
        const [next, ...rest] = state.future;
        if (!next) return state;
        const past = [
          ...state.past,
          { data: state.data, activeId: state.activeId },
        ];
        if (past.length > MAX_HISTORY) {
          past.shift();
        }

        return {
          ...state,
          data: next.data,
          activeId: next.activeId,
          dragActiveId: "",
          hoverActiveId: "",
          past,
          future: rest,
        };
      });
    },
    toMjmlJson: () => {
      const data = get().data;
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
});
