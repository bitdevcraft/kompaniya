"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Input } from "@kompaniya/ui-common/components/input";
import { ScrollArea } from "@kompaniya/ui-common/components/scroll-area";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { GripVertical, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { RecordLayoutField } from "@/components/record-page/layout";
import type { NativeFieldDefinition } from "@/lib/field-definitions";

export interface FieldPaletteProps {
  fields: NativeFieldDefinition[];
}

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: "bg-blue-100 text-blue-800",
  textarea: "bg-blue-100 text-blue-800",
  number: "bg-green-100 text-green-800",
  date: "bg-purple-100 text-purple-800",
  datetime: "bg-purple-100 text-purple-800",
  boolean: "bg-yellow-100 text-yellow-800",
  picklist: "bg-indigo-100 text-indigo-800",
  multipicklist: "bg-indigo-100 text-indigo-800",
  tag: "bg-pink-100 text-pink-800",
  phone: "bg-cyan-100 text-cyan-800",
  email: "bg-cyan-100 text-cyan-800",
  lookup: "bg-orange-100 text-orange-800",
};

export function FieldPalette({ fields }: FieldPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Group fields by category
  const groupedFields = useMemo(() => {
    const filtered = searchQuery
      ? fields.filter(
          (f) =>
            f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.id.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : fields;

    const groups: Record<string, RecordLayoutField[]> = {
      identity: [],
      contact: [],
      organization: [],
      classification: [],
      address: [],
      consent: [],
      activity: [],
      system: [],
      metadata: [],
      custom: [],
    };

    filtered.forEach((field) => {
      const category = field.category || "metadata";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(field);
    });

    return groups;
  }, [fields, searchQuery]);

  return (
    <div className="border rounded-lg bg-card p-4 h-[calc(100vh-200px)] flex flex-col">
      <h3 className="font-semibold mb-4">Field Palette</h3>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fields..."
          value={searchQuery}
        />
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-500px)]">
        <div className="space-y-4 pr-4">
          {Object.entries(groupedFields).map(([category, categoryFields]) =>
            categoryFields.length > 0 ? (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryFields.map((field) => (
                    <FieldCard field={field} key={field.id} />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function FieldCard({ field }: { field: RecordLayoutField }) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    data: {
      field,
      type: "palette",
    },
    id: `palette-${field.id}`,
  });

  const isCustom = (field as NativeFieldDefinition).isCustom === true;

  return (
    <div
      className={cn(
        "p-2 border rounded bg-card hover:bg-accent cursor-grab",
        isDragging && "opacity-50",
      )}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate flex-1">
          {field.label}
        </span>
        <Badge
          className={FIELD_TYPE_COLORS[field.type] || "bg-gray-100"}
          variant="secondary"
        >
          {field.type}
        </Badge>
        {isCustom ? (
          <Badge className="text-xs shrink-0" variant="outline">
            Custom
          </Badge>
        ) : null}
      </div>
      <div className="text-xs text-muted-foreground mt-1 pl-6">{field.id}</div>
    </div>
  );
}
