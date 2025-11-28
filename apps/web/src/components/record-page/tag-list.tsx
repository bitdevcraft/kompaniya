import type { ComponentType } from "react";

import { Badge } from "@kompaniya/ui-common/components/badge";

export interface TagListProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  values?: string[] | null;
}

export function TagList({ icon: Icon, label, values }: TagListProps) {
  if (!values || values.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        <span className="text-sm text-muted-foreground/70">
          No {label.toLowerCase()} yet
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <Badge key={`${label}-${value}-${index}`} variant="secondary">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  );
}
