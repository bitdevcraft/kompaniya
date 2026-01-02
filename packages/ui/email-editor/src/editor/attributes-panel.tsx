import type { UniqueIdentifier } from "@dnd-kit/core";

import { Button } from "@kompaniya/ui-common/components/button";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { Textarea } from "@kompaniya/ui-common/components/textarea";
import { X } from "lucide-react";

import { ATTRIBUTE_GROUPS } from "../config/attributes";
import { useComponentStore } from "../store/use-component-store";

const CONTENT_FIELDS: Record<
  string,
  { label: string; placeholder?: string; multiline?: boolean }
> = {
  "mj-preview": { label: "Preview text", placeholder: "Hello MJML" },
  "mj-title": { label: "Title", placeholder: "Email title" },
  "mj-style": {
    label: "Styles",
    placeholder: ".my-class { color: red; }",
    multiline: true,
  },
  "mj-html-attribute": {
    label: "Value",
    placeholder: "Attribute value",
  },
};

const HEAD_TAGS = new Set([
  "mj-all",
  "mj-attributes",
  "mj-breakpoint",
  "mj-class",
  "mj-font",
  "mj-head",
  "mj-html-attribute",
  "mj-html-attributes",
  "mj-preview",
  "mj-selector",
  "mj-style",
  "mj-title",
]);

export function AttributesPanel({
  activeId,
}: {
  activeId: UniqueIdentifier | "";
}) {
  const node = useComponentStore((s) =>
    activeId ? s.data[activeId] : undefined,
  );
  const setNodeAttribute = useComponentStore((s) => s.setNodeAttribute);
  const removeNodeAttribute = useComponentStore((s) => s.removeNodeAttribute);
  const setNodeContent = useComponentStore((s) => s.setNodeContent);
  const setHeadDefaults = useComponentStore((s) => s.setHeadDefaults);
  const clearHead = useComponentStore((s) => s.clearHead);

  const displayTag = node?.tagName?.startsWith("mj-")
    ? node.tagName.slice(3)
    : node?.tagName;

  const groups = node ? ATTRIBUTE_GROUPS[node.tagName] : null;
  const contentConfig = node ? CONTENT_FIELDS[node.tagName] : null;
  const contentValue = node?.content ?? "";
  const isHeadNode = node?.tagName === "mj-head";
  const showMjClassField =
    Boolean(node?.tagName?.startsWith("mj-")) &&
    !HEAD_TAGS.has(node?.tagName ?? "");

  return (
    <section className="flex flex-col gap-4 rounded-md border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Attributes
          </p>
          {displayTag && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              {displayTag}
            </p>
          )}
        </div>
      </div>

      {!node && (
        <p className="text-xs text-muted-foreground">
          Select a node to edit attributes.
        </p>
      )}

      {node && !groups?.length && !contentConfig && (
        <p className="text-xs text-muted-foreground">
          This node has no style controls yet.
        </p>
      )}

      {node && contentConfig && (
        <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Content
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              {contentConfig.label}
            </span>
            {contentConfig.multiline ? (
              <Textarea
                className="min-h-[96px] text-xs font-mono"
                onChange={(event) =>
                  setNodeContent(
                    activeId as UniqueIdentifier,
                    event.target.value,
                  )
                }
                placeholder={contentConfig.placeholder}
                value={contentValue}
              />
            ) : (
              <Input
                className="h-9 text-xs"
                onChange={(event) =>
                  setNodeContent(
                    activeId as UniqueIdentifier,
                    event.target.value,
                  )
                }
                placeholder={contentConfig.placeholder}
                value={contentValue}
              />
            )}
          </div>
        </div>
      )}

      {node && isHeadNode && (
        <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Head defaults
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setHeadDefaults(activeId as UniqueIdentifier)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Apply default head
            </Button>
            <Button
              onClick={() => clearHead(activeId as UniqueIdentifier)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear head
            </Button>
          </div>
        </div>
      )}

      {node && showMjClassField && (
        <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            MJ class
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Classes</span>
            <div className="flex items-center gap-2">
              <Input
                className="h-9 text-xs"
                onChange={(event) => {
                  const nextValue = event.target.value;
                  if (!nextValue) {
                    removeNodeAttribute(
                      activeId as UniqueIdentifier,
                      "mj-class",
                    );
                    return;
                  }
                  setNodeAttribute(
                    activeId as UniqueIdentifier,
                    "mj-class",
                    nextValue,
                  );
                }}
                placeholder="blue big"
                value={node.attributes?.["mj-class"] ?? ""}
              />
              <Button
                aria-label="Clear MJ class"
                className="h-9 w-9 shrink-0"
                disabled={!node.attributes?.["mj-class"]}
                onClick={() =>
                  removeNodeAttribute(activeId as UniqueIdentifier, "mj-class")
                }
                size="icon"
                type="button"
                variant="ghost"
              >
                <X />
              </Button>
            </div>
          </div>
        </div>
      )}

      {node &&
        groups?.map((group) => (
          <div
            className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3"
            key={group.title}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
            <div className="flex flex-col gap-3">
              {group.fields.map((field) => {
                const value = node.attributes?.[field.key] ?? "";
                const hasValue = value.length > 0;
                return (
                  <div className="flex flex-col gap-1.5" key={field.key}>
                    <span className="text-xs font-medium text-foreground">
                      {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {field.type === "select" ? (
                        <Select
                          onValueChange={(nextValue) => {
                            if (!nextValue) {
                              removeNodeAttribute(
                                activeId as UniqueIdentifier,
                                field.key,
                              );
                              return;
                            }
                            setNodeAttribute(
                              activeId as UniqueIdentifier,
                              field.key,
                              nextValue,
                            );
                          }}
                          value={value || undefined}
                        >
                          <SelectTrigger className="w-full" size="sm">
                            <SelectValue
                              placeholder={field.placeholder ?? "Auto"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options ?? []).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="h-9 text-xs"
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            if (!nextValue) {
                              removeNodeAttribute(
                                activeId as UniqueIdentifier,
                                field.key,
                              );
                              return;
                            }
                            setNodeAttribute(
                              activeId as UniqueIdentifier,
                              field.key,
                              nextValue,
                            );
                          }}
                          placeholder={field.placeholder}
                          value={value}
                        />
                      )}
                      <Button
                        aria-label={`Clear ${field.label}`}
                        className="h-9 w-9 shrink-0"
                        disabled={!hasValue}
                        onClick={() =>
                          removeNodeAttribute(
                            activeId as UniqueIdentifier,
                            field.key,
                          )
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </section>
  );
}
