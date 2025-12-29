/* eslint-disable react/prop-types */
import type { SuggestionProps } from "@tiptap/suggestion";

import { createRoot, type Root } from "react-dom/client";

import type { SlashCommandItem } from "./slash-types";

import { cn } from "../../lib/utils";

interface SlashMenuState {
  props: SuggestionProps<SlashCommandItem>;
  selectedIndex: number;
}

export class SlashMenu {
  private element: HTMLDivElement;
  private props: SuggestionProps<SlashCommandItem>;
  private root: Root;
  private selectedIndex = 0;

  constructor(props: SuggestionProps<SlashCommandItem>) {
    this.props = props;
    this.element = document.createElement("div");
    this.element.className = "z-50";
    document.body.appendChild(this.element);
    this.root = createRoot(this.element);
    this.render();
  }

  destroy() {
    this.root.unmount();
    this.element.remove();
  }

  onKeyDown(props: SuggestionProps<SlashCommandItem>) {
    if (props.items.length === 0) {
      return false;
    }

    if (props.event.key === "ArrowDown") {
      this.selectedIndex = (this.selectedIndex + 1) % props.items.length;
      this.render();
      return true;
    }

    if (props.event.key === "ArrowUp") {
      this.selectedIndex =
        (this.selectedIndex - 1 + props.items.length) % props.items.length;
      this.render();
      return true;
    }

    if (props.event.key === "Enter") {
      const item = props.items[this.selectedIndex];
      if (item) {
        item.command({ editor: props.editor, range: props.range });
        return true;
      }
    }

    return false;
  }

  update(props: SuggestionProps<SlashCommandItem>) {
    this.props = props;
    this.selectedIndex =
      props.items.length === 0
        ? 0
        : Math.min(this.selectedIndex, props.items.length - 1);
    this.render();
  }

  private render() {
    const rect = this.props.clientRect?.();
    if (rect) {
      this.element.style.position = "absolute";
      this.element.style.top = `${rect.bottom + window.scrollY + 4}px`;
      this.element.style.left = `${rect.left + window.scrollX}px`;
    }

    this.root.render(
      <SlashMenuList props={this.props} selectedIndex={this.selectedIndex} />,
    );
  }
}

function SlashMenuList({ props, selectedIndex }: SlashMenuState) {
  if (props.items.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-md">
        No results
      </div>
    );
  }

  return (
    <div className="w-64 rounded-md border border-slate-200 bg-white shadow-md">
      {props.items.map((item, index) => (
        <button
          className={cn(
            "flex w-full flex-col gap-1 px-3 py-2 text-left text-sm transition",
            index === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50",
          )}
          key={item.title}
          onMouseDown={(event) => {
            event.preventDefault();
            item.command({ editor: props.editor, range: props.range });
          }}
          type="button"
        >
          <span className="font-medium text-slate-900">{item.title}</span>
          <span className="text-xs text-slate-500">{item.description}</span>
        </button>
      ))}
    </div>
  );
}
