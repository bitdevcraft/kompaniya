"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kompaniya/ui-common/components/dropdown-menu";
import { DataTableColumnHeader } from "@kompaniya/ui-data-table/components/data-table-column-header";
import {
  DataTableRowAction,
  makeRowAction,
} from "@kompaniya/ui-data-table/utils/data-table-columns";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Ellipsis, Text, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useCustomFieldColumns } from "@/lib/hooks/use-custom-field-columns";
import { DataTableActionType } from "@/types/data-table-actions";

import { tableType } from "./config";

/**
 * Create column helper for type-safe column definitions
 */
const columnHelper = createColumnHelper<tableType>();

export function useDataTableColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<tableType> | null>
  >,
) {
  const onDelete = makeRowAction(setRowAction, DataTableActionType.DELETE);
  const onUpdate = makeRowAction(setRowAction, DataTableActionType.UPDATE);

  // Fetch custom field columns
  const customFieldColumns = useCustomFieldColumns<tableType>("org_contacts");

  // Merge static columns with dynamic custom field columns
  const allColumns = React.useMemo(() => {
    // Static columns using createColumnHelper
    const staticColumns = [
      // Selection column (display column - no accessor)
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            className="translate-y-0.5"
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            className="translate-y-0.5"
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      }),
      // Name column (accessor column)
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: (info) => (
          <Button asChild size="sm" variant="link">
            <Link href={`/crm/contacts/r/${info.row.original.id}`}>
              {info.getValue()}
            </Link>
          </Button>
        ),
        meta: {
          label: "Name",
          placeholder: "Search names...",
          variant: "text",
          icon: Text,
        },
        enableColumnFilter: true,
      }),
      // Actions column (display column)
      columnHelper.display({
        id: "actions",
        meta: {
          label: "Actions",
        },
        enableSorting: false,
        size: 40,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                className="flex size-8 p-0"
                variant="ghost"
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => onUpdate(row)}>
                <Edit />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(row)}
                variant="destructive"
              >
                <Trash2 />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ] as const;

    // Insert custom field columns before the actions column
    const customColumns = customFieldColumns ?? [];
    const actionsColumn = staticColumns[2]; // Actions is at index 2

    return [
      ...staticColumns.slice(0, 2), // select and name columns
      ...customColumns,
      actionsColumn,
    ];
  }, [customFieldColumns, onDelete, onUpdate]);

  return allColumns;
}
