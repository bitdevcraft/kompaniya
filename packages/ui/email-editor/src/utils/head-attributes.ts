import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../types/ui-component";

export type ComponentData = Record<UniqueIdentifier, UiComponentConfig>;

export type HeadAttributesConfig = {
  all: Record<string, string>;
  byTag: Record<string, Record<string, string>>;
  classes: Record<string, Record<string, string>>;
};

const EMPTY_HEAD_ATTRIBUTES: HeadAttributesConfig = {
  all: {},
  byTag: {},
  classes: {},
};

const resolveRootId = (data: ComponentData) => {
  const entry = Object.entries(data).find(
    ([, node]) => node.tagName === "mjml" && !node.parent,
  );
  return entry?.[0];
};

export const isDescendantOfTag = (
  id: UniqueIdentifier,
  data: ComponentData,
  tagName: string,
) => {
  let currentId: UniqueIdentifier | undefined = id;

  while (currentId) {
    const current = data[currentId];
    if (!current) return false;
    if (current.tagName === tagName) return true;
    currentId = current.parent as UniqueIdentifier | undefined;
  }

  return false;
};

const mergeAttributes = (
  base: Record<string, string>,
  incoming: Record<string, string>,
) => ({ ...base, ...incoming });

export const buildHeadAttributes = (
  data: ComponentData,
): HeadAttributesConfig => {
  const rootId = resolveRootId(data);
  if (!rootId) return EMPTY_HEAD_ATTRIBUTES;

  const root = data[rootId];
  if (!root?.items?.length) return EMPTY_HEAD_ATTRIBUTES;

  const result: HeadAttributesConfig = {
    all: {},
    byTag: {},
    classes: {},
  };

  root.items
    .filter((childId) => data[childId]?.tagName === "mj-head")
    .forEach((headId) => {
      const head = data[headId];
      if (!head) return;

      head.items.forEach((childId) => {
        const child = data[childId];
        if (!child || child.tagName !== "mj-attributes") return;

        child.items.forEach((attrId) => {
          const attrNode = data[attrId];
          if (!attrNode) return;

          const attributes = attrNode.attributes ?? {};
          if (attrNode.tagName === "mj-all") {
            result.all = mergeAttributes(result.all, attributes);
            return;
          }

          if (attrNode.tagName === "mj-class") {
            const className = attributes["name"]?.trim();
            if (!className) return;
            const { name, ...classAttributes } = attributes;
            result.classes[className] = mergeAttributes(
              result.classes[className] ?? {},
              classAttributes,
            );
            return;
          }

          result.byTag[attrNode.tagName] = mergeAttributes(
            result.byTag[attrNode.tagName] ?? {},
            attributes,
          );
        });
      });
    });

  return result;
};

export const resolveNodeAttributes = (
  id: UniqueIdentifier,
  data: ComponentData,
  headAttributes?: HeadAttributesConfig,
) => {
  const node = data[id];
  if (!node) return {};

  const inlineAttributes = node.attributes ?? {};
  if (!headAttributes) return inlineAttributes;

  const isBodyNode = isDescendantOfTag(id, data, "mj-body");
  if (!isBodyNode) return inlineAttributes;

  let merged = mergeAttributes({}, headAttributes.all);

  const tagDefaults = headAttributes.byTag[node.tagName];
  if (tagDefaults) {
    merged = mergeAttributes(merged, tagDefaults);
  }

  const classValue = inlineAttributes["mj-class"] ?? "";
  if (classValue.trim()) {
    classValue
      .split(/\s+/)
      .filter(Boolean)
      .forEach((className) => {
        const classAttributes = headAttributes.classes[className];
        if (classAttributes) {
          merged = mergeAttributes(merged, classAttributes);
        }
      });
  }

  return mergeAttributes(merged, inlineAttributes);
};
