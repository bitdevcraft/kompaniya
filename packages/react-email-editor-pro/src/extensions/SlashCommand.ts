import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";

import type { SlashCommandItem } from "../components/editor/slash-types";

import { SlashMenu } from "../components/editor/SlashMenu";

function createMenuRenderer() {
  let renderer: SlashMenu | null = null;

  return {
    onStart: (props: SuggestionProps<SlashCommandItem>) => {
      renderer = new SlashMenu(props);
    },
    onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
      renderer?.update(props);
    },
    onKeyDown: (props: SuggestionProps<SlashCommandItem>) => {
      if (props.event.key === "Escape") {
        renderer?.destroy();
        return true;
      }
      return renderer?.onKeyDown(props) ?? false;
    },
    onExit: () => {
      renderer?.destroy();
      renderer = null;
    },
  };
}

export const SlashCommand = Extension.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,
        items: ({ query }: { query: string }): SlashCommandItem[] => {
          const items: SlashCommandItem[] = [
            {
              title: "Text",
              description: "Start writing with text.",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent(" ")
                  .run();
              },
            },
            {
              title: "Image",
              description: "Insert an image block.",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent({ type: "mj-image" })
                  .run();
              },
            },
            {
              title: "Button",
              description: "Insert a button block.",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent({ type: "mj-button" })
                  .run();
              },
            },
            {
              title: "2 Columns",
              description: "Insert a two-column layout.",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent({
                    type: "mj-section",
                    content: [
                      {
                        type: "mj-column",
                        content: [
                          {
                            type: "mj-text",
                            content: [{ type: "text", text: "Column 1" }],
                          },
                        ],
                      },
                      {
                        type: "mj-column",
                        content: [
                          {
                            type: "mj-text",
                            content: [{ type: "text", text: "Column 2" }],
                          },
                        ],
                      },
                    ],
                  })
                  .run();
              },
            },
            {
              title: "3 Columns",
              description: "Insert a three-column layout.",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent({
                    type: "mj-section",
                    content: [
                      {
                        type: "mj-column",
                        content: [
                          {
                            type: "mj-text",
                            content: [{ type: "text", text: "Column 1" }],
                          },
                        ],
                      },
                      {
                        type: "mj-column",
                        content: [
                          {
                            type: "mj-text",
                            content: [{ type: "text", text: "Column 2" }],
                          },
                        ],
                      },
                      {
                        type: "mj-column",
                        content: [
                          {
                            type: "mj-text",
                            content: [{ type: "text", text: "Column 3" }],
                          },
                        ],
                      },
                    ],
                  })
                  .run();
              },
            },
          ];

          return items.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          );
        },
        render: createMenuRenderer(),
      },
    };
  },

  addProseMirrorPlugins() {
    return [Suggestion(this.options.suggestion)];
  },
});
