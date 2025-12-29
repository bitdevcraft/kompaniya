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

function renderNode(node: JSONContent): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  const children = (node.content ?? []).map(renderNode).join("");
  const attrs = attrsToString(node.attrs ?? undefined);
  const attributes = attrs.length > 0 ? ` ${attrs}` : "";
  const tag = node.type ?? "div";

  return `<${tag}${attributes}>${children}</${tag}>`;
}
