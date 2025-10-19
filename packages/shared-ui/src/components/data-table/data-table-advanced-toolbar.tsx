"use client";

import type { Table } from "@tanstack/react-table";
import type * as React from "react";

import { cn } from "@repo/shared-ui/lib/utils";

import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableAdvancedToolbarProps<TData>
  extends React.ComponentProps<"div"> {
  table: Table<TData>;
  hideViewColumns?: boolean;
}

export function DataTableAdvancedToolbar<TData>({
  table,
  children,
  className,
  hideViewColumns = false,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-center justify-end gap-2 p-1",
        className,
      )}
      role="toolbar"
      {...props}
    >
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {children}
      </div>
      <div className="flex items-center gap-2">
        {!hideViewColumns && <DataTableViewOptions table={table} />}
      </div>
    </div>
  );
}
