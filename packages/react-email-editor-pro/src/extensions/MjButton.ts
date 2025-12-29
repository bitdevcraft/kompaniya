import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ButtonComponent } from "../components/editor/ButtonComponent";

export const MjButton = Node.create({
  name: "mjButton",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      href: { default: "https://example.com" },
      backgroundColor: { default: "#2563eb" },
      color: { default: "#ffffff" },
      padding: { default: "12px 24px" },
      align: { default: "center" },
      text: { default: "Button" },
    };
  },

  parseHTML() {
    return [{ tag: "mj-button" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mj-button", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ButtonComponent);
  },
});
