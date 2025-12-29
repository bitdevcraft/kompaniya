import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ImageComponent } from "../components/editor/ImageComponent";

export const MjImage = Node.create({
  name: "mjImage",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: "https://placehold.co/600x200" },
      width: { default: "100%" },
      align: { default: "center" },
      padding: { default: "10px" },
      alt: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "mj-image" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mj-image", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
