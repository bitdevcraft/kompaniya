import type { Block, BlockType, TemplateDoc } from "../schema/types";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const toAttributeValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
};

const toAttributes = (props: Record<string, unknown>) => {
  return Object.entries(props)
    .map(([key, value]) => {
      const attrValue = toAttributeValue(value);
      if (attrValue === null) {
        return null;
      }
      return `${key}="${escapeHtml(attrValue)}"`;
    })
    .filter((part): part is string => Boolean(part))
    .join(" ");
};

const renderChildren = (doc: TemplateDoc, block: Block) => {
  if (!block.children?.length) {
    return "";
  }
  return block.children
    .map((childId) => doc.blocks[childId])
    .filter((child): child is Block => Boolean(child))
    .map((child) => renderBlock(doc, child))
    .join("");
};

const renderBlock = (doc: TemplateDoc, block: Block): string => {
  const attrs = toAttributes(block.props ?? {});
  const attrString = attrs.length > 0 ? ` ${attrs}` : "";

  const renderMap: Record<BlockType, (b: Block) => string> = {
    section: (b) =>
      `<mj-section${attrString}>${renderChildren(doc, b)}</mj-section>`,
    column: (b) =>
      `<mj-column${attrString}>${renderChildren(doc, b)}</mj-column>`,
    text: (b) => {
      const content = escapeHtml(String(b.props?.content ?? ""));
      return `<mj-text${attrString}>${content}</mj-text>`;
    },
    image: () => `<mj-image${attrString} />`,
    button: (b) => {
      const content = escapeHtml(String(b.props?.content ?? "Button"));
      return `<mj-button${attrString}>${content}</mj-button>`;
    },
    divider: () => `<mj-divider${attrString} />`,
    spacer: () => `<mj-spacer${attrString} />`,
    wrapper: (b) =>
      `<mj-wrapper${attrString}>${renderChildren(doc, b)}</mj-wrapper>`,
    group: (b) => `<mj-group${attrString}>${renderChildren(doc, b)}</mj-group>`,
    social: (b) =>
      `<mj-social${attrString}>${renderChildren(doc, b)}</mj-social>`,
    hero: (b) => `<mj-hero${attrString}>${renderChildren(doc, b)}</mj-hero>`,
  };

  return renderMap[block.type](block);
};

export const jsonToMjml = (doc: TemplateDoc) => {
  const root = doc.blocks[doc.root];
  if (!root) {
    return "<mjml><mj-body /></mjml>";
  }
  const body = renderBlock(doc, root);
  return `<mjml><mj-body>${body}</mj-body></mjml>`;
};
