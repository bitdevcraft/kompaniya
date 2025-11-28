"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@kompaniya/ui-common/components/toggle-group";
import {
  type DataTableViewMode,
  useDataTableViewMode,
} from "@kompaniya/ui-data-table/hooks/use-data-table-view-mode";
import { LayoutGrid, List } from "lucide-react";
import * as React from "react";

export interface DataTableViewToggleProps
  extends Omit<
    React.ComponentProps<typeof ToggleGroup>,
    "type" | "value" | "onValueChange"
  > {
  paramKey?: string;
  defaultValue?: DataTableViewMode;
  onViewModeChange?: (viewMode: DataTableViewMode) => void;
  viewMode?: DataTableViewMode;
}

export function DataTableViewToggle({
  paramKey,
  defaultValue,
  onViewModeChange,
  viewMode: controlledViewMode,
  size = "sm",
  variant = "outline",
  ...toggleGroupProps
}: DataTableViewToggleProps) {
  const [internalViewMode, setInternalViewMode] = useDataTableViewMode({
    key: paramKey,
    defaultValue,
  });

  const isControlled = controlledViewMode != null;
  const viewMode = isControlled ? controlledViewMode : internalViewMode;

  const handleChange = React.useCallback(
    (value: string) => {
      if (!isDataTableViewMode(value)) {
        return;
      }

      if (!isControlled) {
        setInternalViewMode(value);
      }

      onViewModeChange?.(value);
    },
    [isControlled, onViewModeChange, setInternalViewMode],
  );

  return (
    <ToggleGroup
      {...toggleGroupProps}
      onValueChange={handleChange}
      size={size}
      type="single"
      value={viewMode}
      variant={variant}
    >
      <ToggleGroupItem aria-label="Table view" value="table">
        <List className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Grid view" value="grid">
        <LayoutGrid className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function isDataTableViewMode(value: string): value is DataTableViewMode {
  return value === "table" || value === "grid";
}
