/* eslint-disable @next/next/no-img-element */
/* cspell:ignore soundcloud dribbble noshare */
import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { applyPaddingStyles, NodeStyles } from "./node-styles";
import { useContentEditable } from "./use-content-editable";

const DEFAULT_ICON_SIZE = "20px";
const DEFAULT_TEXT_PADDING = "4px 4px 4px 0";

const SOCIAL_COLORS: Record<string, string> = {
  facebook: "#1877f2",
  twitter: "#1da1f2",
  x: "#000000",
  google: "#db4437",
  pinterest: "#e60023",
  linkedin: "#0a66c2",
  tumblr: "#36465d",
  xing: "#006567",
  github: "#24292f",
  instagram: "#e1306c",
  web: "#4b5563",
  snapchat: "#fffc00",
  youtube: "#ff0000",
  vimeo: "#1ab7ea",
  medium: "#000000",
  soundcloud: "#ff5500",
  dribbble: "#ea4c89",
};

const resolveBaseName = (value?: string) => {
  if (!value) return "";
  return value.toLowerCase().replace(/-noshare$/, "");
};

const resolveIconLabel = (value?: string) => {
  const base = resolveBaseName(value);
  if (!base) return "S";
  return base[0]?.toUpperCase() ?? "S";
};

const resolveIconColor = (value?: string) => {
  const base = resolveBaseName(value);
  return SOCIAL_COLORS[base] ?? "#6b7280";
};

const resolveAlignItems = (value?: string) => {
  if (value === "top") return "flex-start";
  if (value === "bottom") return "flex-end";
  return "center";
};

export const buildSocialElementStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const textStyles: React.CSSProperties = {};
  const hasPadding =
    attributes["padding"] ||
    attributes["padding-top"] ||
    attributes["padding-right"] ||
    attributes["padding-bottom"] ||
    attributes["padding-left"];

  const align = attributes["align"];
  if (
    align === "left" ||
    align === "right" ||
    align === "center" ||
    align === "justify"
  ) {
    containerStyles.textAlign = align;
  }

  textStyles.color = attributes["color"] ?? "#000000";
  if (attributes["font-family"]) {
    textStyles.fontFamily = attributes["font-family"];
  }
  textStyles.fontSize = attributes["font-size"] ?? "13px";
  if (attributes["font-style"]) textStyles.fontStyle = attributes["font-style"];
  if (attributes["font-weight"]) {
    textStyles.fontWeight = attributes["font-weight"];
  }
  textStyles.lineHeight = attributes["line-height"] ?? "1";
  if (attributes["text-decoration"]) {
    textStyles.textDecoration = attributes["text-decoration"];
  }

  if (!hasPadding) {
    containerStyles.padding = "4px";
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles: textStyles };
};

type MjSocialElementNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  attributes: Record<string, string>;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
  insertSiblingAfter: (
    id: UniqueIdentifier,
    tagName: string,
  ) => UniqueIdentifier | null;
};

export function MjSocialElementNode({
  id,
  node,
  attributes,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
  insertSiblingAfter,
}: MjSocialElementNodeProps) {
  const { contentRef, handleFocus, handleInput } =
    useContentEditable<HTMLSpanElement>({
      id,
      content: node.content,
      isActive,
      setActiveId,
      setNodeContent,
    });

  const iconSize = attributes["icon-size"] ?? DEFAULT_ICON_SIZE;
  const iconHeight = attributes["icon-height"] ?? iconSize;
  const iconPadding = attributes["icon-padding"];
  const iconRadius = attributes["border-radius"] ?? "3px";
  const iconPosition =
    attributes["icon-position"] === "right" ? "row-reverse" : "row";
  const iconBackground =
    attributes["background-color"] ?? resolveIconColor(attributes["name"]);
  const iconLabel = resolveIconLabel(attributes["name"]);
  const iconSrc = attributes["src"];

  const textPadding =
    attributes["text-padding"] ??
    (iconPosition === "row-reverse" ? "4px 0 4px 4px" : DEFAULT_TEXT_PADDING);

  const iconWrapperStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: iconBackground,
    borderRadius: iconRadius,
    ...(iconPadding ? { padding: iconPadding } : {}),
  };

  const iconStyles: React.CSSProperties = {
    width: iconSize,
    height: iconHeight,
  };

  const textStyles: React.CSSProperties = {
    ...contentStyles,
    padding: textPadding,
  };

  return (
    <div
      className="inline-flex"
      onClick={(event) => event.stopPropagation()}
      style={{
        flexDirection: iconPosition,
        alignItems: resolveAlignItems(attributes["vertical-align"]),
      }}
    >
      <span style={iconWrapperStyles}>
        {iconSrc ? (
          <img
            alt={attributes["alt"] ?? attributes["name"] ?? "Social"}
            sizes={attributes["sizes"]}
            src={iconSrc}
            srcSet={attributes["srcset"]}
            style={iconStyles}
            title={attributes["title"]}
          />
        ) : (
          <span
            style={{
              ...iconStyles,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 600,
              color: "#ffffff",
              textTransform: "uppercase",
            }}
          >
            {iconLabel}
          </span>
        )}
      </span>
      <span
        aria-label="Social label"
        aria-multiline={false}
        className="min-h-6 border border-transparent bg-transparent px-1 py-1 text-sm outline-none focus-visible:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        contentEditable
        data-placeholder="Social label..."
        onClick={(event) => event.stopPropagation()}
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            const newId = insertSiblingAfter(id, "mj-social-element");
            if (newId) {
              setActiveId(newId);
            }
          }
        }}
        ref={contentRef}
        role="textbox"
        style={textStyles}
        suppressContentEditableWarning
      />
    </div>
  );
}
