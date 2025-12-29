import type { JSONContent } from "@tiptap/core";

import mjml2html from "mjml-browser";

export function jsonToMjml(json: JSONContent): string {
  if (json.type === "doc") {
    const body = (json.content ?? []).map(renderNode).join("");
    return `<mjml><mj-body>${body}</mj-body></mjml>`;
  }

  return renderNode(json);
}

export function mjmlToHtml(mjml: string): string {
  if (typeof window === "undefined") {
    throw new Error("mjmlToHtml can only be called in the browser.");
  }

  const { html } = mjml2html(mjml);
  return html;
}

function attrsToString(attrs: Record<string, unknown> | undefined): string {
  if (!attrs) return "";
  return Object.entries(attrs)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(" ");
}

function nodeTypeToTag(type: string | undefined): string {
  if (!type) return "div";

  const map: Record<string, string> = {
    mjSection: "mj-section",
    mjColumn: "mj-column",
    mjText: "mj-text",
    mjImage: "mj-image",
    mjButton: "mj-button",
  };

  return map[type] ?? type;
}

function renderNode(node: JSONContent): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  const children = (node.content ?? []).map(renderNode).join("");
  const attrs = attrsToString(node.attrs ?? undefined);
  const attributes = attrs.length > 0 ? ` ${attrs}` : "";
  const tag = nodeTypeToTag(node.type);

  return `<${tag}${attributes}>${children}</${tag}>`;
}
