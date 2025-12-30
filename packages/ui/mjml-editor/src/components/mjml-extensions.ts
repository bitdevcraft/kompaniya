"use client";

import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  type Editor,
  Extension,
  type JSONContent,
  mergeAttributes,
  Node,
  type Range,
} from "@tiptap/core";
import UniqueID from "@tiptap/extension-unique-id";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";

type SlashCommandItem = {
  title: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
};

const mjmlNodeClass = "mjml-node";
export const mjmlUniqueIdAttributeName = "data-mjml-id";
const uniqueIdAttributeName = mjmlUniqueIdAttributeName;
const uniqueIdTypes = [
  "mjmlSection",
  "mjmlColumn",
  "mjmlText",
  "mjmlButton",
  "mjmlImage",
  "mjmlDivider",
  "mjmlSpacer",
];
const mjmlHandleTargets = new Set([
  "mjmlButton",
  "mjmlColumn",
  "mjmlDivider",
  "mjmlImage",
  "mjmlSection",
  "mjmlSpacer",
  "mjmlText",
]);

const baseStyleAttributes = {
  backgroundColor: { default: null },
  color: { default: null },
  fontFamily: { default: null },
  fontSize: { default: null },
  fontWeight: { default: null },
  lineHeight: { default: null },
  align: { default: null },
  padding: { default: null },
  paddingTop: { default: null },
  paddingRight: { default: null },
  paddingBottom: { default: null },
  paddingLeft: { default: null },
  width: { default: null },
  height: { default: null },
  border: { default: null },
  borderRadius: { default: null },
  borderWidth: { default: null },
  borderStyle: { default: null },
  borderColor: { default: null },
};

const inlineStyleMappings: Array<[string, string]> = [
  ["backgroundColor", "background-color"],
  ["color", "color"],
  ["fontFamily", "font-family"],
  ["fontSize", "font-size"],
  ["fontWeight", "font-weight"],
  ["lineHeight", "line-height"],
  ["align", "text-align"],
  ["padding", "padding"],
  ["paddingTop", "padding-top"],
  ["paddingRight", "padding-right"],
  ["paddingBottom", "padding-bottom"],
  ["paddingLeft", "padding-left"],
  ["width", "width"],
  ["height", "height"],
  ["border", "border"],
  ["borderRadius", "border-radius"],
  ["borderWidth", "border-width"],
  ["borderStyle", "border-style"],
  ["borderColor", "border-color"],
];

const buildInlineStyle = (attrs: Record<string, unknown>) => {
  const entries = inlineStyleMappings
    .map(([key, cssKey]) => {
      const value = attrs[key];
      if (value === null || typeof value === "undefined" || value === "") {
        return "";
      }
      return `${cssKey}: ${String(value)};`;
    })
    .filter(Boolean);
  return entries.join(" ");
};

const resolveBorderValue = (
  border: unknown,
  borderWidth: unknown,
  borderStyle: unknown,
  borderColor: unknown,
) => {
  if (typeof border === "string" && border.trim()) {
    return border.trim();
  }
  const parts = [
    typeof borderWidth === "string" ? borderWidth : "",
    typeof borderStyle === "string" ? borderStyle : "",
    typeof borderColor === "string" ? borderColor : "",
  ].filter(Boolean);
  return parts.join(" ");
};

export const MjmlDoc = Node.create({
  name: "doc",
  topNode: true,
  content: "mjmlSection+",
});

const createHandleElement = () => {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "mjml-node__handle";
  handle.setAttribute("aria-label", "Drag to move block");
  handle.setAttribute("contenteditable", "false");
  handle.setAttribute("data-mjml-handle", "true");
  handle.setAttribute("draggable", "true");
  handle.setAttribute("tabindex", "-1");
  return handle;
};

export const MjmlNodeHandles = Extension.create({
  name: "mjmlNodeHandles",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("mjmlNodeHandles"),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (!mjmlHandleTargets.has(node.type.name)) {
                return;
              }
              decorations.push(
                Decoration.widget(pos + 1, () => createHandleElement(), {
                  side: -1,
                }),
              );
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

export const MjmlSection = Node.create({
  name: "mjmlSection",
  group: "block",
  content: "mjmlColumn+",
  isolating: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
    };
  },
  parseHTML() {
    return [{ tag: "mj-section" }];
  },
  renderHTML({ HTMLAttributes }) {
    const inlineStyle = buildInlineStyle(HTMLAttributes);
    return [
      "mj-section",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-section`,
        "data-label": "Section",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
      0,
    ];
  },
});

export const MjmlColumn = Node.create({
  name: "mjmlColumn",
  group: "block",
  content: "(mjmlText|mjmlButton|mjmlImage|mjmlDivider|mjmlSpacer)+",
  isolating: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
    };
  },
  parseHTML() {
    return [{ tag: "mj-column" }];
  },
  renderHTML({ HTMLAttributes }) {
    const inlineStyle = buildInlineStyle(HTMLAttributes);
    return [
      "mj-column",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-column`,
        "data-label": "Column",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
      0,
    ];
  },
});

export const MjmlText = Node.create({
  name: "mjmlText",
  group: "block",
  content: "inline*",
  defining: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
    };
  },
  parseHTML() {
    return [{ tag: "mj-text" }];
  },
  renderHTML({ HTMLAttributes }) {
    const inlineStyle = buildInlineStyle(HTMLAttributes);
    return [
      "mj-text",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-text`,
        "data-label": "Text",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
      0,
    ];
  },
});

export const MjmlButton = Node.create({
  name: "mjmlButton",
  group: "block",
  content: "inline*",
  defining: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
      href: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-button" }];
  },
  renderHTML({ HTMLAttributes }) {
    const inlineStyle = buildInlineStyle(HTMLAttributes);
    return [
      "mj-button",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-button`,
        "data-label": "Button",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
      0,
    ];
  },
});

export const MjmlImage = Node.create({
  name: "mjmlImage",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
      src: {
        default: "https://placehold.co/600x240",
      },
      alt: {
        default: "Image",
      },
      width: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-image" }];
  },
  renderHTML({ HTMLAttributes }) {
    const inlineStyle = buildInlineStyle(HTMLAttributes);
    const src =
      typeof HTMLAttributes.src === "string" ? HTMLAttributes.src : "";
    const alt =
      typeof HTMLAttributes.alt === "string" ? HTMLAttributes.alt : "";
    return [
      "mj-image",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-image`,
        "data-label": "Image",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
      ["img", { src, alt, draggable: "false" }],
    ];
  },
});

export const MjmlDivider = Node.create({
  name: "mjmlDivider",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
      borderColor: {
        default: "#e2e8f0",
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-divider" }];
  },
  renderHTML({ HTMLAttributes }) {
    const { border, borderWidth, borderStyle, borderColor, ...rest } =
      HTMLAttributes as Record<string, unknown>;
    const baseStyle = buildInlineStyle(rest);
    const resolvedBorder = resolveBorderValue(
      border,
      borderWidth,
      borderStyle,
      borderColor,
    );
    const dividerStyle = resolvedBorder
      ? `border-top: ${resolvedBorder}; border-left: 0; border-right: 0; border-bottom: 0;`
      : "";
    const inlineStyle = [baseStyle, dividerStyle].filter(Boolean).join(" ");
    return [
      "mj-divider",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-divider`,
        "data-label": "Divider",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
    ];
  },
});

export const MjmlSpacer = Node.create({
  name: "mjmlSpacer",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...baseStyleAttributes,
      height: {
        default: "24px",
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-spacer" }];
  },
  renderHTML({ HTMLAttributes }) {
    const inlineStyle = buildInlineStyle(HTMLAttributes);
    return [
      "mj-spacer",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-spacer`,
        "data-label": "Spacer",
        ...(inlineStyle ? { style: inlineStyle } : {}),
      }),
    ];
  },
});

const replaceNearestBlock = (
  editor: Editor,
  range: Range,
  node: JSONContent,
) => {
  const { $from } = editor.state.selection;
  const replaceable = new Set([
    "mjmlButton",
    "mjmlDivider",
    "mjmlImage",
    "mjmlSpacer",
    "mjmlText",
  ]);
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const target = $from.node(depth);
    if (replaceable.has(target.type.name)) {
      const from = $from.before(depth);
      const to = $from.after(depth);
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContentAt({ from, to }, node)
        .run();
      return;
    }
  }
  editor.chain().focus().deleteRange(range).insertContent(node).run();
};

const insertAfterParent = (
  editor: Editor,
  range: Range,
  parentType: string,
  node: JSONContent,
) => {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const target = $from.node(depth);
    if (target.type.name === parentType) {
      const insertPos = $from.after(depth);
      const { tr } = editor.state;
      tr.deleteRange(range.from, range.to);
      const mappedPos = tr.mapping.map(insertPos);
      tr.insert(mappedPos, editor.schema.nodeFromJSON(node));
      editor.view.dispatch(tr.scrollIntoView());
      return;
    }
  }
  editor.chain().focus().deleteRange(range).insertContent(node).run();
};

const slashCommandItems = (): SlashCommandItem[] => [
  {
    title: "Section",
    description: "Create a new MJML section with a column",
    command: ({ editor, range }) => {
      insertAfterParent(editor, range, "mjmlSection", {
        type: "mjmlSection",
        content: [
          {
            type: "mjmlColumn",
            content: [
              {
                type: "mjmlText",
                content: [{ type: "text", text: "New section" }],
              },
            ],
          },
        ],
      });
    },
  },
  {
    title: "Column",
    description: "Insert a column block",
    command: ({ editor, range }) => {
      insertAfterParent(editor, range, "mjmlColumn", {
        type: "mjmlColumn",
        content: [
          {
            type: "mjmlText",
            content: [{ type: "text", text: "Column content" }],
          },
        ],
      });
    },
  },
  {
    title: "Text",
    description: "Insert an MJML text block",
    command: ({ editor, range }) => {
      replaceNearestBlock(editor, range, {
        type: "mjmlText",
        content: [{ type: "text", text: "Editable text" }],
      });
    },
  },
  {
    title: "Button",
    description: "Insert an MJML button",
    command: ({ editor, range }) => {
      replaceNearestBlock(editor, range, {
        type: "mjmlButton",
        attrs: { href: "https://example.com" },
        content: [{ type: "text", text: "Call to action" }],
      });
    },
  },
  {
    title: "Image",
    description: "Insert an MJML image",
    command: ({ editor, range }) => {
      replaceNearestBlock(editor, range, {
        type: "mjmlImage",
        attrs: { src: "https://placehold.co/600x240", alt: "Image" },
      });
    },
  },
  {
    title: "Divider",
    description: "Insert an MJML divider",
    command: ({ editor, range }) => {
      replaceNearestBlock(editor, range, { type: "mjmlDivider" });
    },
  },
  {
    title: "Spacer",
    description: "Insert an MJML spacer",
    command: ({ editor, range }) => {
      replaceNearestBlock(editor, range, { type: "mjmlSpacer" });
    },
  },
];

type SlashSuggestionProps = SuggestionProps<SlashCommandItem, SlashCommandItem>;

const createSlashMenu = () => {
  let menu: HTMLDivElement | null = null;
  let selectedIndex = 0;
  let currentProps: SlashSuggestionProps | null = null;

  const updateMenu = (props: SlashSuggestionProps) => {
    if (!menu) {
      return;
    }
    const { items, command, clientRect } = props;
    if (!items.length) {
      menu.style.display = "none";
      return;
    }
    menu.style.display = "block";
    const rect = clientRect?.();
    if (rect) {
      menu.style.left = `${rect.left + window.scrollX}px`;
      menu.style.top = `${rect.bottom + window.scrollY + 6}px`;
    }
    menu.innerHTML = "";
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = cn(
        "mjml-slash-item",
        index === selectedIndex && "mjml-slash-item--active",
      );
      button.addEventListener("click", () => command(item));
      const title = document.createElement("div");
      title.className = "mjml-slash-item__title";
      title.textContent = item.title;
      const description = document.createElement("div");
      description.className = "mjml-slash-item__description";
      description.textContent = item.description;
      button.append(title, description);
      menu?.append(button);
    });
  };

  return {
    onStart: (props: SlashSuggestionProps) => {
      selectedIndex = 0;
      currentProps = props;
      menu = document.createElement("div");
      menu.className = "mjml-slash-menu";
      document.body.append(menu);
      updateMenu(props);
    },
    onUpdate: (props: SlashSuggestionProps) => {
      if (!menu) {
        return;
      }
      currentProps = props;
      updateMenu(props);
    },
    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (!menu || !currentProps) {
        return false;
      }
      if (props.event.key === "ArrowDown") {
        props.event.preventDefault();
        selectedIndex =
          (selectedIndex + 1) % Math.max(currentProps.items.length, 1);
        updateMenu(currentProps);
        return true;
      }
      if (props.event.key === "ArrowUp") {
        props.event.preventDefault();
        selectedIndex =
          (selectedIndex - 1 + currentProps.items.length) %
          Math.max(currentProps.items.length, 1);
        updateMenu(currentProps);
        return true;
      }
      if (props.event.key === "Enter") {
        props.event.preventDefault();
        const item = currentProps.items[selectedIndex];
        if (item) {
          currentProps.command(item);
        }
        return true;
      }
      return false;
    },
    onExit: () => {
      menu?.remove();
      menu = null;
      currentProps = null;
    },
  };
};

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => {
          const items = slashCommandItems();
          if (!query) {
            return items;
          }
          return items.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          );
        },
        render: () => createSlashMenu(),
      }),
    ];
  },
});

export type MjmlJsonNode = {
  tagName: string;
  attributes?: Record<string, string>;
  content?: Array<MjmlJsonNode | string> | string;
};

const toKebabCase = (value: string) => {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

const toCamelCase = (value: string) => {
  return value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
};

const mapAttributesToMjml = (
  attrs?: Record<string, unknown>,
): Record<string, string> | undefined => {
  if (!attrs) {
    return undefined;
  }
  const mapped: Record<string, string> = {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || typeof value === "undefined") {
      return;
    }
    mapped[toKebabCase(key)] = String(value);
  });
  return Object.keys(mapped).length ? mapped : undefined;
};

const mapAttributesToTiptap = (
  attrs?: Record<string, string>,
): Record<string, string> | undefined => {
  if (!attrs) {
    return undefined;
  }
  const mapped: Record<string, string> = {};
  Object.entries(attrs).forEach(([key, value]) => {
    mapped[toCamelCase(key)] = value;
  });
  return Object.keys(mapped).length ? mapped : undefined;
};

const normalizeMjmlContent = (
  content?: MjmlJsonNode["content"],
): Array<MjmlJsonNode | string> => {
  if (!content) {
    return [];
  }
  return Array.isArray(content) ? content : [content];
};

const buildInlineText = (content?: JSONContent[]): string => {
  if (!content) {
    return "";
  }
  return content
    .map((node) => {
      if (node.type === "text") {
        return node.text ?? "";
      }
      if (node.type === "hardBreak") {
        return "\n";
      }
      if (node.content) {
        return buildInlineText(node.content);
      }
      return "";
    })
    .join("");
};

const mjmlTextContent = (content?: MjmlJsonNode["content"]): string => {
  const normalized = normalizeMjmlContent(content);
  if (!normalized.length && typeof content === "string") {
    return content;
  }
  return normalized
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      return mjmlTextContent(item.content);
    })
    .join("");
};

const toInlineContent = (text: string): JSONContent[] => {
  if (!text) {
    return [];
  }
  return [{ type: "text", text }];
};

const tiptapNodeToMjml = (node: JSONContent): MjmlJsonNode | null => {
  switch (node.type) {
    case "mjmlSection": {
      const columns = (node.content ?? [])
        .map(tiptapNodeToMjml)
        .filter(Boolean) as MjmlJsonNode[];
      return {
        tagName: "mj-section",
        attributes: mapAttributesToMjml(node.attrs),
        content: columns.length
          ? columns
          : [
              {
                tagName: "mj-column",
                content: [{ tagName: "mj-text", content: "" }],
              },
            ],
      };
    }
    case "mjmlColumn": {
      const blocks = (node.content ?? [])
        .map(tiptapNodeToMjml)
        .filter(Boolean) as MjmlJsonNode[];
      return {
        tagName: "mj-column",
        attributes: mapAttributesToMjml(node.attrs),
        content: blocks.length ? blocks : [{ tagName: "mj-text", content: "" }],
      };
    }
    case "mjmlText":
      return {
        tagName: "mj-text",
        attributes: mapAttributesToMjml(node.attrs),
        content: buildInlineText(node.content),
      };
    case "mjmlButton":
      return {
        tagName: "mj-button",
        attributes: mapAttributesToMjml(node.attrs),
        content: buildInlineText(node.content),
      };
    case "mjmlImage":
      return {
        tagName: "mj-image",
        attributes: mapAttributesToMjml(node.attrs),
      };
    case "mjmlDivider":
      return {
        tagName: "mj-divider",
        attributes: mapAttributesToMjml(node.attrs),
      };
    case "mjmlSpacer":
      return {
        tagName: "mj-spacer",
        attributes: mapAttributesToMjml(node.attrs),
      };
    default: {
      const text = buildInlineText(node.content);
      if (!text) {
        return null;
      }
      return {
        tagName: "mj-text",
        content: text,
      };
    }
  }
};

export const tiptapJsonToMjmlJson = (doc: JSONContent): MjmlJsonNode => {
  const root =
    doc.type === "doc"
      ? doc
      : ({
          type: "doc",
          content: [doc],
        } satisfies JSONContent);
  const sections = (root.content ?? [])
    .map(tiptapNodeToMjml)
    .filter(Boolean) as MjmlJsonNode[];
  return {
    tagName: "mjml",
    content: [
      {
        tagName: "mj-body",
        content: sections,
      },
    ],
  };
};

const mjmlNodeToTiptap = (node: MjmlJsonNode): JSONContent | null => {
  switch (node.tagName) {
    case "mj-section": {
      const columns = normalizeMjmlContent(node.content)
        .filter((item): item is MjmlJsonNode => typeof item !== "string")
        .map(mjmlNodeToTiptap)
        .filter(Boolean) as JSONContent[];
      return {
        type: "mjmlSection",
        attrs: mapAttributesToTiptap(node.attributes),
        content: columns.length
          ? columns
          : [
              {
                type: "mjmlColumn",
                content: [
                  {
                    type: "mjmlText",
                    content: [],
                  },
                ],
              },
            ],
      };
    }
    case "mj-column": {
      const blocks = normalizeMjmlContent(node.content)
        .filter((item): item is MjmlJsonNode => typeof item !== "string")
        .map(mjmlNodeToTiptap)
        .filter(Boolean) as JSONContent[];
      return {
        type: "mjmlColumn",
        attrs: mapAttributesToTiptap(node.attributes),
        content: blocks.length
          ? blocks
          : [
              {
                type: "mjmlText",
                content: [],
              },
            ],
      };
    }
    case "mj-text": {
      const text = mjmlTextContent(node.content);
      return {
        type: "mjmlText",
        attrs: mapAttributesToTiptap(node.attributes),
        content: toInlineContent(text),
      };
    }
    case "mj-button": {
      const text = mjmlTextContent(node.content);
      return {
        type: "mjmlButton",
        attrs: mapAttributesToTiptap(node.attributes),
        content: toInlineContent(text),
      };
    }
    case "mj-image":
      return {
        type: "mjmlImage",
        attrs: mapAttributesToTiptap(node.attributes),
      };
    case "mj-divider":
      return {
        type: "mjmlDivider",
        attrs: mapAttributesToTiptap(node.attributes),
      };
    case "mj-spacer":
      return {
        type: "mjmlSpacer",
        attrs: mapAttributesToTiptap(node.attributes),
      };
    default: {
      const text = mjmlTextContent(node.content);
      return {
        type: "mjmlText",
        content: toInlineContent(text),
      };
    }
  }
};

export const mjmlJsonToTiptapJson = (mjml: MjmlJsonNode): JSONContent => {
  const body =
    mjml.tagName === "mjml"
      ? normalizeMjmlContent(mjml.content).find(
          (item): item is MjmlJsonNode =>
            typeof item !== "string" && item.tagName === "mj-body",
        )
      : undefined;
  const rootContent = body ? normalizeMjmlContent(body.content) : [mjml];
  const sections = rootContent
    .filter((item): item is MjmlJsonNode => typeof item !== "string")
    .map(mjmlNodeToTiptap)
    .filter(Boolean) as JSONContent[];
  const safeSections = sections.length
    ? sections
    : [
        {
          type: "mjmlSection",
          content: [
            {
              type: "mjmlColumn",
              content: [
                {
                  type: "mjmlText",
                  content: [],
                },
              ],
            },
          ],
        },
      ];
  return {
    type: "doc",
    content: safeSections,
  };
};

const buildAttributesString = (attrs?: Record<string, string>) => {
  if (!attrs) {
    return "";
  }
  return Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
};

export const mjmlJsonToMjmlString = (
  node: MjmlJsonNode,
  indentLevel = 0,
): string => {
  const indent = "  ".repeat(indentLevel);
  const attrs = buildAttributesString(node.attributes);
  const content = normalizeMjmlContent(node.content);
  if (!content.length) {
    return `${indent}<${node.tagName}${attrs} />`;
  }
  if (
    content.length === 1 &&
    typeof content[0] === "string" &&
    content[0].trim() !== ""
  ) {
    return `${indent}<${node.tagName}${attrs}>${content[0]}</${node.tagName}>`;
  }
  const inner = content
    .map((child) => {
      if (typeof child === "string") {
        return `${indent}  ${child}`;
      }
      return mjmlJsonToMjmlString(child, indentLevel + 1);
    })
    .join("\n");
  return `${indent}<${node.tagName}${attrs}>\n${inner}\n${indent}</${node.tagName}>`;
};

export const mjmlEmailExtensions = [
  MjmlDoc,
  UniqueID.configure({
    types: uniqueIdTypes,
    attributeName: uniqueIdAttributeName,
  }),
  MjmlNodeHandles,
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlButton,
  MjmlImage,
  MjmlDivider,
  MjmlSpacer,
  SlashCommand,
];
