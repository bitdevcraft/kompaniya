import { nanoid } from "nanoid";

export interface Block<T = Record<string, unknown>> {
  id: string;
  type: BlockType;
  props: T;
  children?: string[];
}

export type BlockType =
  | "section"
  | "column"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "wrapper"
  | "group"
  | "social"
  | "hero";

export interface TemplateDoc {
  meta: TemplateMeta;
  root: string;
  blocks: Record<string, Block>;
  theme?: ThemeTokens;
}

export interface TemplateMeta {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeTokens {
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  radius?: string;
  spacing?: string;
}

const createBlockId = () => nanoid();

export const createEmptyDoc = (name: string): TemplateDoc => {
  const now = new Date().toISOString();
  const rootId = createBlockId();
  const columnId = createBlockId();
  const textId = createBlockId();

  return {
    meta: {
      id: createBlockId(),
      name,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    root: rootId,
    blocks: {
      [rootId]: {
        id: rootId,
        type: "section",
        props: {},
        children: [columnId],
      },
      [columnId]: {
        id: columnId,
        type: "column",
        props: {},
        children: [textId],
      },
      [textId]: {
        id: textId,
        type: "text",
        props: {
          content: "Edit me",
        },
      },
    },
  };
};
