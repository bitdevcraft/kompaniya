"use client";

import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  type Editor,
  Extension,
  mergeAttributes,
  Node,
  type Range,
} from "@tiptap/core";
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

export const MjmlSection = Node.create({
  name: "mjmlSection",
  group: "block",
  content: "mjmlColumn+",
  isolating: true,
  parseHTML() {
    return [{ tag: "mj-section" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mj-section",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-section`,
        "data-label": "Section",
      }),
      0,
    ];
  },
});

export const MjmlColumn = Node.create({
  name: "mjmlColumn",
  group: "block",
  content: "block+",
  isolating: true,
  parseHTML() {
    return [{ tag: "mj-column" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mj-column",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-column`,
        "data-label": "Column",
      }),
      0,
    ];
  },
});

export const MjmlText = Node.create({
  name: "mjmlText",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: "mj-text" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mj-text",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-text`,
        "data-label": "Text",
      }),
      0,
    ];
  },
});

export const MjmlButton = Node.create({
  name: "mjmlButton",
  group: "block",
  content: "inline*",
  addAttributes() {
    return {
      href: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-button" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mj-button",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-button`,
        "data-label": "Button",
      }),
      0,
    ];
  },
});

export const MjmlImage = Node.create({
  name: "mjmlImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
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
    return [
      "mj-image",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-image`,
        "data-label": "Image",
      }),
    ];
  },
});

export const MjmlDivider = Node.create({
  name: "mjmlDivider",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      borderColor: {
        default: "#e2e8f0",
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-divider" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mj-divider",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-divider`,
        "data-label": "Divider",
      }),
    ];
  },
});

export const MjmlSpacer = Node.create({
  name: "mjmlSpacer",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      height: {
        default: "24px",
      },
    };
  },
  parseHTML() {
    return [{ tag: "mj-spacer" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "mj-spacer",
      mergeAttributes(HTMLAttributes, {
        class: `${mjmlNodeClass} mjml-spacer`,
        "data-label": "Spacer",
      }),
    ];
  },
});

const slashCommandItems = (): SlashCommandItem[] => [
  {
    title: "Section",
    description: "Create a new MJML section with a column",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
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
        })
        .run();
    },
  },
  {
    title: "Column",
    description: "Insert a column block",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "mjmlColumn",
          content: [
            {
              type: "mjmlText",
              content: [{ type: "text", text: "Column content" }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: "Text",
    description: "Insert an MJML text block",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "mjmlText",
          content: [{ type: "text", text: "Editable text" }],
        })
        .run();
    },
  },
  {
    title: "Button",
    description: "Insert an MJML button",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "mjmlButton",
          attrs: { href: "https://example.com" },
          content: [{ type: "text", text: "Call to action" }],
        })
        .run();
    },
  },
  {
    title: "Image",
    description: "Insert an MJML image",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "mjmlImage",
          attrs: { src: "https://placehold.co/600x240", alt: "Image" },
        })
        .run();
    },
  },
  {
    title: "Divider",
    description: "Insert an MJML divider",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: "mjmlDivider" })
        .run();
    },
  },
  {
    title: "Spacer",
    description: "Insert an MJML spacer",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({ type: "mjmlSpacer" })
        .run();
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

export const mjmlEmailExtensions = [
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlButton,
  MjmlImage,
  MjmlDivider,
  MjmlSpacer,
  SlashCommand,
];
