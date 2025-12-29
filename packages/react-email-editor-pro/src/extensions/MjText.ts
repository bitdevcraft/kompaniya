import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { TextComponent } from "../components/editor/TextComponent";

export const MjText = Node.create({
  name: "mjText",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      align: { default: "left" },
      color: { default: "#111827" },
      fontSize: { default: "14px" },
      padding: { default: "10px" },
    };
  },

  parseHTML() {
    return [{ tag: "mj-text" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mj-text", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextComponent);
  },
});
