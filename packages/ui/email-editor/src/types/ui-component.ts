import { UniqueIdentifier } from "@dnd-kit/core";

export type MjmlAttributes = Record<string, string>;

export interface MjmlJsonNode {
  tagName: string;
  attributes?: MjmlAttributes;
  children?: MjmlJsonNode[];
  content?: string;
}

export interface UiComponentConfig {
  tagName: string;
  items: UniqueIdentifier[];
  parent?: UniqueIdentifier;
  attributes: MjmlAttributes;
  content?: string;
}
