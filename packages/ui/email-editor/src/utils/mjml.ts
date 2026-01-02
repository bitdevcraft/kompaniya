import type { MjmlJsonNode } from "../types/ui-component";

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const HTML_STYLE_TAGS = new Set(["td", "th", "tr"]);
const HTML_STYLE_KEYS = new Set([
  "background-color",
  "border",
  "border-bottom",
  "border-left",
  "border-right",
  "border-top",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "text-decoration",
  "text-transform",
]);

const buildStyleString = (attributes: Record<string, string>) => {
  const entries = Array.from(HTML_STYLE_KEYS)
    .map((key) => {
      const value = attributes[key];
      if (value === undefined || value === null || value === "") return null;
      return `${key}:${value}`;
    })
    .filter((entry): entry is string => Boolean(entry));

  const existingStyle = attributes["style"];
  if (existingStyle) {
    entries.unshift(existingStyle);
  }

  return entries.join("; ");
};

const formatAttributes = (
  tagName: string,
  attributes?: Record<string, string>,
) => {
  if (!attributes) return "";

  const useStyleMapping = HTML_STYLE_TAGS.has(tagName);
  const styleValue = useStyleMapping ? buildStyleString(attributes) : "";

  return Object.entries(attributes)
    .filter(([key, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (useStyleMapping && key === "style") return false;
      if (useStyleMapping && HTML_STYLE_KEYS.has(key)) return false;
      return true;
    })
    .concat(styleValue ? [["style", styleValue]] : [])
    .map(([key, value]) => ` ${key}="${escapeAttribute(value)}"`)
    .join("");
};

export const serializeMjml = (node: MjmlJsonNode, depth = 0): string => {
  const indent = "  ".repeat(depth);
  const attrs = formatAttributes(node.tagName, node.attributes);

  if (node.children?.length) {
    const children = node.children
      .map((child) => serializeMjml(child, depth + 1))
      .join("\n");
    return `${indent}<${node.tagName}${attrs}>\n${children}\n${indent}</${node.tagName}>`;
  }

  const content = node.content ?? "";
  if (!content) {
    return `${indent}<${node.tagName}${attrs}></${node.tagName}>`;
  }

  return `${indent}<${node.tagName}${attrs}>${content}</${node.tagName}>`;
};

export const formatMjmlErrors = (errors: unknown[]) => {
  if (!errors.length) return "";

  const formatted = errors
    .map((error) => {
      if (typeof error === "string") return error;
      if (error instanceof Error) return error.message;

      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    })
    .join("\n");

  return `<!-- MJML errors:\n${formatted}\n-->`;
};
