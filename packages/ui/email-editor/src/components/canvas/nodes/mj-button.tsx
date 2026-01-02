import type { UniqueIdentifier } from "@dnd-kit/core";

import type { UiComponentConfig } from "../../../types/ui-component";

import { applyPaddingStyles, NodeStyles } from "./node-styles";
import { useContentEditable } from "./use-content-editable";

export const buildButtonStyles = (
  attributes: Record<string, string>,
): NodeStyles => {
  const containerStyles: React.CSSProperties = {};
  const buttonStyles: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: attributes["background-color"] ?? "#414141",
    color: attributes["color"] ?? "#ffffff",
    borderRadius: attributes["border-radius"] ?? "3px",
    border: attributes["border"] ?? "none",
  };
  const hasPadding =
    attributes["padding"] ||
    attributes["padding-top"] ||
    attributes["padding-right"] ||
    attributes["padding-bottom"] ||
    attributes["padding-left"];

  const align = attributes["align"];
  if (align) containerStyles.textAlign = align;

  if (attributes["container-background-color"]) {
    containerStyles.backgroundColor = attributes["container-background-color"];
  }

  if (attributes["border-top"])
    buttonStyles.borderTop = attributes["border-top"];
  if (attributes["border-right"]) {
    buttonStyles.borderRight = attributes["border-right"];
  }
  if (attributes["border-bottom"]) {
    buttonStyles.borderBottom = attributes["border-bottom"];
  }
  if (attributes["border-left"]) {
    buttonStyles.borderLeft = attributes["border-left"];
  }

  if (attributes["font-family"]) {
    buttonStyles.fontFamily = attributes["font-family"];
  }
  buttonStyles.fontSize = attributes["font-size"] ?? "13px";
  if (attributes["font-style"])
    buttonStyles.fontStyle = attributes["font-style"];
  buttonStyles.fontWeight = attributes["font-weight"] ?? "normal";
  buttonStyles.lineHeight = attributes["line-height"] ?? "120%";
  if (attributes["letter-spacing"]) {
    buttonStyles.letterSpacing = attributes["letter-spacing"];
  }
  buttonStyles.textDecoration = attributes["text-decoration"] ?? "none";
  if (attributes["text-transform"]) {
    buttonStyles.textTransform = attributes["text-transform"];
  }

  if (attributes["text-align"])
    buttonStyles.textAlign = attributes["text-align"];
  if (attributes["height"]) buttonStyles.height = attributes["height"];
  if (attributes["width"]) buttonStyles.width = attributes["width"];

  const innerPadding = attributes["inner-padding"] ?? "10px 25px";
  if (innerPadding) {
    buttonStyles.padding = innerPadding;
  }

  if (!hasPadding) {
    containerStyles.padding = "10px 25px";
  }

  applyPaddingStyles(containerStyles, attributes);

  return { containerStyles, contentStyles: buttonStyles };
};

type MjButtonNodeProps = {
  id: UniqueIdentifier;
  node: UiComponentConfig;
  contentStyles: React.CSSProperties;
  isActive: boolean;
  setActiveId: (id: UniqueIdentifier) => void;
  setNodeContent: (id: UniqueIdentifier, content: string) => void;
};

export function MjButtonNode({
  id,
  node,
  contentStyles,
  isActive,
  setActiveId,
  setNodeContent,
}: MjButtonNodeProps) {
  const { contentRef, handleFocus, handleInput } =
    useContentEditable<HTMLSpanElement>({
      id,
      content: node.content,
      defaultContent: "Button",
      preferDefaultWhenEmpty: true,
      isActive,
      setActiveId,
      setNodeContent,
    });

  return (
    <button
      onClick={(event) => event.stopPropagation()}
      style={contentStyles}
      type="button"
    >
      <span
        aria-label="Button text"
        className="outline-none focus-visible:outline-none"
        contentEditable
        onClick={(event) => event.stopPropagation()}
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
        ref={contentRef}
        role="textbox"
        suppressContentEditableWarning
      />
    </button>
  );
}
