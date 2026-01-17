"use client";

import type { ComponentType } from "react";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Input } from "@kompaniya/ui-common/components/input";
import { ScrollArea } from "@kompaniya/ui-common/components/scroll-area";
import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  Activity,
  Building2,
  ChartColumn,
  DollarSign,
  Inbox,
  Mail,
  Puzzle,
  Search,
  Settings,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  ComponentCategory,
  CustomComponentDefinition,
} from "@/lib/component-definitions";

export interface ComponentPaletteProps {
  components: CustomComponentDefinition[];
}

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  activity: "Activity",
  analytics: "Analytics",
  communication: "Communication",
  custom: "Custom",
  finance: "Finance",
  organization: "Organization",
  system: "System",
} as const satisfies Record<ComponentCategory, string>;

const CATEGORY_ICONS: Record<
  ComponentCategory,
  ComponentType<{ className?: string }>
> = {
  activity: Activity,
  analytics: ChartColumn,
  communication: Mail,
  custom: Puzzle,
  finance: DollarSign,
  organization: Building2,
  system: Settings,
} as const satisfies Record<
  ComponentCategory,
  ComponentType<{ className?: string }>
>;

export function ComponentPalette({ components }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const groupedComponents = useMemo(() => {
    const filtered = searchQuery
      ? components.filter((component) => {
          const query = searchQuery.toLowerCase();
          return (
            component.label.toLowerCase().includes(query) ||
            component.id.toLowerCase().includes(query) ||
            (component.description || "").toLowerCase().includes(query)
          );
        })
      : components;

    const groups: Record<ComponentCategory, CustomComponentDefinition[]> = {
      activity: [],
      analytics: [],
      communication: [],
      custom: [],
      finance: [],
      organization: [],
      system: [],
    };

    filtered.forEach((component) => {
      const category = component.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(component);
    });

    return groups;
  }, [components, searchQuery]);

  const hasComponents = Object.values(groupedComponents).some(
    (items) => items.length > 0,
  );

  return (
    <div className="border rounded-lg bg-card p-4 h-[calc(100vh-200px)] flex flex-col">
      <h3 className="font-semibold mb-4">Component Palette</h3>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components..."
          value={searchQuery}
        />
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-500px)]">
        {!hasComponents ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No components match your search"
                : "No components available for this entity type"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pr-4">
            {Object.entries(groupedComponents).map(([category, items]) =>
              items.length > 0 ? (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {CATEGORY_LABELS[category as ComponentCategory]}
                  </h4>
                  <div className="space-y-2">
                    {items.map((component) => (
                      <ComponentCard component={component} key={component.id} />
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ComponentCard({
  component,
}: {
  component: CustomComponentDefinition;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    data: {
      component,
      type: "component-palette",
    },
    id: `component-${component.id}`,
  });

  const Icon = CATEGORY_ICONS[component.category] ?? Puzzle;

  return (
    <div
      className={cn(
        "p-3 border rounded bg-card hover:bg-accent cursor-grab",
        isDragging && "opacity-50",
      )}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{component.label}</span>
            <Badge className="text-xs" variant="outline">
              Component
            </Badge>
          </div>
          {component.description ? (
            <p className="text-xs text-muted-foreground mt-1">
              {component.description}
            </p>
          ) : null}
          <div className="text-xs text-muted-foreground mt-1">
            {component.id}
          </div>
        </div>
      </div>
    </div>
  );
}
