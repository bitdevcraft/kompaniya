"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@kompaniya/ui-common/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kompaniya/ui-common/components/popover";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { Check, ChevronsUpDown, Settings2 } from "lucide-react";
import * as React from "react";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
        ),
    [table],
  );

  // Separate columns into standard and custom fields
  const { standardColumns, customFieldColumns } = React.useMemo(() => {
    const standard: typeof columns = [];
    const customFields: typeof columns = [];

    for (const column of columns) {
      if (column.columnDef.meta?.isCustomField) {
        customFields.push(column);
      } else {
        standard.push(column);
      }
    }

    return { standardColumns: standard, customFieldColumns: customFields };
  }, [columns]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Toggle columns"
          className="ml-auto hidden h-8 lg:flex"
          role="combobox"
          size="sm"
          variant="outline"
        >
          <Settings2 />
          View
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-0">
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>

            {/* Standard Columns */}
            {standardColumns.length > 0 && (
              <CommandGroup heading="Standard Columns">
                {standardColumns.map((column) => (
                  <CommandItem
                    key={column.id}
                    onSelect={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                  >
                    <span className="truncate">
                      {column.columnDef.meta?.label ?? column.id}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        column.getIsVisible() ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Custom Fields */}
            {customFieldColumns.length > 0 && (
              <>
                {standardColumns.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Custom Fields">
                  {customFieldColumns.map((column) => (
                    <CommandItem
                      key={column.id}
                      onSelect={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      <span className="truncate">
                        {column.columnDef.meta?.label ?? column.id}
                      </span>
                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0",
                          column.getIsVisible() ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
