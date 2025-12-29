import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { SectionComponent } from "../components/editor/SectionComponent";

export const MjSection = Node.create({
  name: "mjSection",
  group: "block",
  content: "mjColumn+",
  defining: true,

  addAttributes() {
    return {
      backgroundColor: { default: "#ffffff" },
      padding: { default: "20px" },
    };
  },

  parseHTML() {
    return [{ tag: "mj-section" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mj-section", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionComponent);
  },
});
