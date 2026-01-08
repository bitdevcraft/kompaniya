"use client";

import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import { GripVertical, X } from "lucide-react";

import type { RecordLayoutField } from "@/components/record-page/layout";

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

export interface FieldItemProps {
  field: RecordLayoutField;
  onRemove: () => void;
}

export function FieldItem({ field, onRemove }: FieldItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/50 rounded group">
      <div className="flex items-center gap-2 flex-1">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{field.label}</span>
            <Badge className={FIELD_TYPE_COLORS[field.type] || "bg-gray-100"}>
              {field.type}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">{field.id}</div>
        </div>
      </div>
      <Button
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        size="sm"
        variant="ghost"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
