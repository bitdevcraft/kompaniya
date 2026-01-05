import type { UniqueIdentifier } from "@dnd-kit/core";

import { Button } from "@kompaniya/ui-common/components/button";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kompaniya/ui-common/components/popover";
import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BaselineIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  HighlighterIcon,
  ItalicIcon,
  Link2Icon,
  MinusIcon,
  PlusIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useEmailDocStore } from "../store";

const TEXT_TAGS = new Set([
  "mj-accordion-text",
  "mj-accordion-title",
  "mj-button",
  "mj-navbar-link",
  "mj-social-element",
  "mj-text",
  "td",
  "th",
]);

const LINK_TAGS = new Set([
  "mj-button",
  "mj-navbar-link",
  "mj-social-element",
  "mj-text",
]);

const ALIGN_KEY_BY_TAG: Record<string, "align" | "text-align"> = {
  "mj-button": "text-align",
};

const HEADING_PRESETS = [
  { label: "Heading 1", size: "32px", weight: "700", Icon: Heading1Icon },
  { label: "Heading 2", size: "24px", weight: "700", Icon: Heading2Icon },
  { label: "Heading 3", size: "20px", weight: "700", Icon: Heading3Icon },
  { label: "Heading 4", size: "18px", weight: "700", Icon: Heading4Icon },
  { label: "Heading 5", size: "16px", weight: "700", Icon: Heading5Icon },
  { label: "Heading 6", size: "14px", weight: "700", Icon: Heading6Icon },
] as const;

const DEFAULT_FONT_SIZE = 13;
const FONT_SIZE_STEP = 1;
const SUBSCRIPT_FONT_SIZE = "0.75em";
const SUBSCRIPT_LINE_HEIGHT = "1";
const SUPERSCRIPT_FONT_SIZE = "0.75em";
const SUPERSCRIPT_LINE_HEIGHT = "1";
const DEFAULT_TEXT_COLOR = "#111827";
const DEFAULT_HIGHLIGHT_COLOR = "#fff3cd";
const COLOR_PICKER_DEBOUNCE_MS = 120;

const COLOR_INPUT_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const parseFontSize = (value?: string) => {
  if (!value) return null;
  const match = value.trim().match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  if (!match) return null;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return null;
  return { numeric, unit: match[2] || "px" };
};

const formatFontSize = (numeric: number, unit: string) => {
  const rounded = Math.round(numeric * 100) / 100;
  return `${rounded}${unit}`;
};

const isBoldValue = (value?: string) => {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "bold") return true;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && numeric >= 600;
};

const resolveColorInput = (value: string | undefined, fallback: string) => {
  if (value && COLOR_INPUT_PATTERN.test(value.trim())) {
    return value.trim();
  }
  return fallback;
};

const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCallback = useRef(callback);

  useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: Args) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        latestCallback.current(...args);
      }, delay);
    },
    [cancel, delay],
  );

  const flush = useCallback(
    (...args: Args) => {
      cancel();
      latestCallback.current(...args);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { debounced, flush, cancel };
};

export function TextToolbar({
  activeId,
  viewMode,
}: {
  activeId: UniqueIdentifier | "";
  viewMode: "editor" | "preview";
}) {
  const node = useEmailDocStore((s) =>
    activeId ? s.doc[activeId] : undefined,
  );
  const setNodeAttribute = useEmailDocStore((s) => s.setNodeAttribute);
  const removeNodeAttribute = useEmailDocStore((s) => s.removeNodeAttribute);

  const isTextNode = Boolean(node && TEXT_TAGS.has(node.tagName));
  const isEnabled = viewMode === "editor" && isTextNode;
  const isLinkable = Boolean(node && LINK_TAGS.has(node.tagName));
  const attributes = node?.attributes ?? {};
  const currentFontSize = attributes["font-size"] ?? "";
  const currentDecoration = attributes["text-decoration"] ?? "";
  const alignKey = ALIGN_KEY_BY_TAG[node?.tagName ?? ""] ?? "align";
  const currentAlign = attributes[alignKey] ?? "";
  const linkValue = attributes["href"] ?? "";
  const currentTextColor = attributes["color"] ?? "";
  const currentHighlightColor = attributes["background-color"] ?? "";
  const textColorPickerValue = resolveColorInput(
    currentTextColor,
    DEFAULT_TEXT_COLOR,
  );
  const highlightColorPickerValue = resolveColorInput(
    currentHighlightColor,
    DEFAULT_HIGHLIGHT_COLOR,
  );
  const [textColorDraft, setTextColorDraft] = useState(textColorPickerValue);
  const [highlightColorDraft, setHighlightColorDraft] = useState(
    highlightColorPickerValue,
  );

  useEffect(() => {
    setTextColorDraft(textColorPickerValue);
  }, [textColorPickerValue]);

  useEffect(() => {
    setHighlightColorDraft(highlightColorPickerValue);
  }, [highlightColorPickerValue]);

  const setAttributeValueForId = useCallback(
    (id: UniqueIdentifier, key: string, value: string) => {
      if (!id || !isEnabled || activeId !== id) return;
      if (!value.trim()) {
        removeNodeAttribute(id, key);
        return;
      }
      setNodeAttribute(id, key, value);
    },
    [activeId, isEnabled, removeNodeAttribute, setNodeAttribute],
  );

  const {
    debounced: debouncedSetAttributeValue,
    flush: flushSetAttributeValue,
  } = useDebouncedCallback(setAttributeValueForId, COLOR_PICKER_DEBOUNCE_MS);

  const setAttributeValue = (key: string, value: string) => {
    if (!activeId || !isEnabled) return;
    setAttributeValueForId(activeId, key, value);
  };

  const handleHeading = (size: string, weight: string) => {
    if (!activeId || !isEnabled) return;
    setNodeAttribute(activeId, "font-size", size);
    setNodeAttribute(activeId, "font-weight", weight);
  };

  const handleFontSizeAdjust = (delta: number) => {
    if (!activeId || !isEnabled) return;
    const parsed = parseFontSize(attributes["font-size"]);
    const numeric = parsed?.numeric ?? DEFAULT_FONT_SIZE;
    const unit = parsed?.unit ?? "px";
    const nextValue = Math.max(1, numeric + delta);
    setNodeAttribute(activeId, "font-size", formatFontSize(nextValue, unit));
  };

  const handleBoldToggle = () => {
    if (!activeId || !isEnabled) return;
    const nextValue = isBoldValue(attributes["font-weight"]) ? "normal" : "700";
    setNodeAttribute(activeId, "font-weight", nextValue);
  };

  const handleItalicToggle = () => {
    if (!activeId || !isEnabled) return;
    const nextValue =
      attributes["font-style"] === "italic" ? "normal" : "italic";
    setNodeAttribute(activeId, "font-style", nextValue);
  };

  const handleUnderlineToggle = () => {
    if (!activeId || !isEnabled) return;
    const nextValue = currentDecoration === "underline" ? "none" : "underline";
    setNodeAttribute(activeId, "text-decoration", nextValue);
  };

  const handleStrikethroughToggle = () => {
    if (!activeId || !isEnabled) return;
    const nextValue =
      currentDecoration === "line-through" ? "none" : "line-through";
    setNodeAttribute(activeId, "text-decoration", nextValue);
  };

  const handleSubscriptToggle = () => {
    if (!activeId || !isEnabled) return;
    const isActive =
      attributes["font-size"] === SUBSCRIPT_FONT_SIZE &&
      attributes["line-height"] === SUBSCRIPT_LINE_HEIGHT;
    if (isActive) {
      removeNodeAttribute(activeId, "font-size");
      removeNodeAttribute(activeId, "line-height");
      return;
    }
    setNodeAttribute(activeId, "font-size", SUBSCRIPT_FONT_SIZE);
    setNodeAttribute(activeId, "line-height", SUBSCRIPT_LINE_HEIGHT);
  };

  const handleSuperscriptToggle = () => {
    if (!activeId || !isEnabled) return;
    const isActive =
      attributes["font-size"] === SUPERSCRIPT_FONT_SIZE &&
      attributes["line-height"] === SUPERSCRIPT_LINE_HEIGHT;
    if (isActive) {
      removeNodeAttribute(activeId, "font-size");
      removeNodeAttribute(activeId, "line-height");
      return;
    }
    setNodeAttribute(activeId, "font-size", SUPERSCRIPT_FONT_SIZE);
    setNodeAttribute(activeId, "line-height", SUPERSCRIPT_LINE_HEIGHT);
  };

  const handleAlignChange = (value: string) => {
    if (!activeId || !isEnabled) return;
    setNodeAttribute(activeId, alignKey, value);
  };

  return (
    <div
      aria-disabled={!isEnabled}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-background/90 p-2 shadow-sm",
        isEnabled && "sticky top-0 z-10",
        !isEnabled && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-1">
        {HEADING_PRESETS.map(({ label, size, weight, Icon }) => (
          <Button
            aria-label={label}
            className={cn(
              "h-8 w-8",
              currentFontSize === size && "bg-muted text-foreground",
            )}
            disabled={!isEnabled}
            key={label}
            onClick={() => handleHeading(size, weight)}
            size="icon"
            title={label}
            type="button"
            variant="ghost"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <span aria-hidden="true" className="h-6 w-px bg-border" />

      <div className="flex flex-wrap items-center gap-1">
        <Button
          aria-label="Align left"
          className={cn("h-8 w-8", currentAlign === "left" && "bg-muted")}
          disabled={!isEnabled}
          onClick={() => handleAlignChange("left")}
          size="icon"
          title="Align left"
          type="button"
          variant="ghost"
        >
          <AlignLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Align center"
          className={cn("h-8 w-8", currentAlign === "center" && "bg-muted")}
          disabled={!isEnabled}
          onClick={() => handleAlignChange("center")}
          size="icon"
          title="Align center"
          type="button"
          variant="ghost"
        >
          <AlignCenterIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Align right"
          className={cn("h-8 w-8", currentAlign === "right" && "bg-muted")}
          disabled={!isEnabled}
          onClick={() => handleAlignChange("right")}
          size="icon"
          title="Align right"
          type="button"
          variant="ghost"
        >
          <AlignRightIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Justify"
          className={cn("h-8 w-8", currentAlign === "justify" && "bg-muted")}
          disabled={!isEnabled}
          onClick={() => handleAlignChange("justify")}
          size="icon"
          title="Justify"
          type="button"
          variant="ghost"
        >
          <AlignJustifyIcon className="h-4 w-4" />
        </Button>
      </div>

      <span aria-hidden="true" className="h-6 w-px bg-border" />

      <div className="flex flex-wrap items-center gap-1">
        <Button
          aria-label="Bold"
          className={cn(
            "h-8 w-8",
            isBoldValue(attributes["font-weight"]) &&
              "bg-muted text-foreground",
          )}
          disabled={!isEnabled}
          onClick={handleBoldToggle}
          size="icon"
          title="Bold"
          type="button"
          variant="ghost"
        >
          <BoldIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Italic"
          className={cn(
            "h-8 w-8",
            attributes["font-style"] === "italic" && "bg-muted text-foreground",
          )}
          disabled={!isEnabled}
          onClick={handleItalicToggle}
          size="icon"
          title="Italic"
          type="button"
          variant="ghost"
        >
          <ItalicIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Underline"
          className={cn(
            "h-8 w-8",
            currentDecoration === "underline" && "bg-muted text-foreground",
          )}
          disabled={!isEnabled}
          onClick={handleUnderlineToggle}
          size="icon"
          title="Underline"
          type="button"
          variant="ghost"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Strikethrough"
          className={cn(
            "h-8 w-8",
            currentDecoration === "line-through" && "bg-muted text-foreground",
          )}
          disabled={!isEnabled}
          onClick={handleStrikethroughToggle}
          size="icon"
          title="Strikethrough"
          type="button"
          variant="ghost"
        >
          <StrikethroughIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Subscript"
          className={cn(
            "h-8 w-8",
            attributes["font-size"] === SUBSCRIPT_FONT_SIZE &&
              attributes["line-height"] === SUBSCRIPT_LINE_HEIGHT &&
              "bg-muted text-foreground",
          )}
          disabled={!isEnabled}
          onClick={handleSubscriptToggle}
          size="icon"
          title="Subscript"
          type="button"
          variant="ghost"
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Superscript"
          className={cn(
            "h-8 w-8",
            attributes["font-size"] === SUPERSCRIPT_FONT_SIZE &&
              attributes["line-height"] === SUPERSCRIPT_LINE_HEIGHT &&
              "bg-muted text-foreground",
          )}
          disabled={!isEnabled}
          onClick={handleSuperscriptToggle}
          size="icon"
          title="Superscript"
          type="button"
          variant="ghost"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
      </div>

      <span aria-hidden="true" className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Button
          aria-label="Decrease font size"
          className="h-8 w-8"
          disabled={!isEnabled}
          onClick={() => handleFontSizeAdjust(-FONT_SIZE_STEP)}
          size="icon"
          title="Decrease font size"
          type="button"
          variant="ghost"
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Increase font size"
          className="h-8 w-8"
          disabled={!isEnabled}
          onClick={() => handleFontSizeAdjust(FONT_SIZE_STEP)}
          size="icon"
          title="Increase font size"
          type="button"
          variant="ghost"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <span aria-hidden="true" className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Insert link"
              className={cn("h-8 w-8", linkValue && "bg-muted text-foreground")}
              disabled={!isEnabled || !isLinkable}
              size="icon"
              title="Insert link"
              type="button"
              variant="ghost"
            >
              <Link2Icon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Link
              </p>
              <Input
                className="h-8 text-xs"
                onChange={(event) =>
                  setAttributeValue("href", event.target.value)
                }
                placeholder="https://example.com"
                value={linkValue}
              />
              <Button
                disabled={!linkValue}
                onClick={() => setAttributeValue("href", "")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Clear link
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <span aria-hidden="true" className="h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Text color"
              className={cn(
                "h-8 w-8",
                currentTextColor && "bg-muted text-foreground",
              )}
              disabled={!isEnabled}
              size="icon"
              title="Text color"
              type="button"
              variant="ghost"
            >
              <BaselineIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Text color
              </p>
              <div className="flex items-center gap-2">
                <Input
                  className="h-8 w-12 p-1"
                  onBlur={(event) => {
                    if (!activeId) return;
                    flushSetAttributeValue(
                      activeId,
                      "color",
                      event.target.value,
                    );
                  }}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setTextColorDraft(nextValue);
                    if (!activeId) return;
                    debouncedSetAttributeValue(activeId, "color", nextValue);
                  }}
                  type="color"
                  value={textColorDraft}
                />
                <Input
                  className="h-8 text-xs"
                  onChange={(event) =>
                    setAttributeValue("color", event.target.value)
                  }
                  placeholder={DEFAULT_TEXT_COLOR}
                  value={currentTextColor}
                />
              </div>
              <Button
                disabled={!currentTextColor}
                onClick={() => setAttributeValue("color", "")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Clear color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label="Highlight"
              className={cn(
                "h-8 w-8",
                currentHighlightColor && "bg-muted text-foreground",
              )}
              disabled={!isEnabled}
              size="icon"
              title="Highlight"
              type="button"
              variant="ghost"
            >
              <HighlighterIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Highlight
              </p>
              <div className="flex items-center gap-2">
                <Input
                  className="h-8 w-12 p-1"
                  onBlur={(event) => {
                    if (!activeId) return;
                    flushSetAttributeValue(
                      activeId,
                      "background-color",
                      event.target.value,
                    );
                  }}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setHighlightColorDraft(nextValue);
                    if (!activeId) return;
                    debouncedSetAttributeValue(
                      activeId,
                      "background-color",
                      nextValue,
                    );
                  }}
                  type="color"
                  value={highlightColorDraft}
                />
                <Input
                  className="h-8 text-xs"
                  onChange={(event) =>
                    setAttributeValue("background-color", event.target.value)
                  }
                  placeholder={DEFAULT_HIGHLIGHT_COLOR}
                  value={currentHighlightColor}
                />
              </div>
              <Button
                disabled={!currentHighlightColor}
                onClick={() => setAttributeValue("background-color", "")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Clear highlight
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
