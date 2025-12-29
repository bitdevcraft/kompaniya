import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ColumnComponent } from "../components/editor/ColumnComponent";

export const MjColumn = Node.create({
  name: "mj-column",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      width: { default: "100%" },
      padding: { default: "10px" },
      backgroundColor: { default: "transparent" },
    };
  },

  parseHTML() {
    return [{ tag: "mj-column" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mj-column", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnComponent);
  },
});
