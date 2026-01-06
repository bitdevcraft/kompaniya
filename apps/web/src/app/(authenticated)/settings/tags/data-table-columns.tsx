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
  defineMeta,
  getTableColumns,
  makeRowAction,
} from "@kompaniya/ui-data-table/utils/data-table-columns";
import { convertCase } from "@repo/shared/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Ellipsis, Text, Trash2 } from "lucide-react";

import { DataTableActionType } from "@/types/data-table-actions";

import { tableType } from "./config";

export function useDataTableColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<tableType> | null>
  >,
) {
  const onDelete = makeRowAction(setRowAction, DataTableActionType.DELETE);
  const onUpdate = makeRowAction(setRowAction, DataTableActionType.UPDATE);
  const onView = makeRowAction(setRowAction, DataTableActionType.VIEW);

  const columns: ColumnDef<tableType>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          className="translate-y-0.5"
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      size: 5,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Button onClick={() => onView(row)} size={"sm"} variant={"link"}>
          {row.original.name}
        </Button>
      ),
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "relatedType",
      accessorKey: "relatedType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Related Type" />
      ),
      cell: ({ row }) =>
        row.original.relatedType
          ? convertCase(row.original.relatedType, "kebab", "title")
          : "-",
      meta: {
        label: "Related Type",
        placeholder: "Search related types...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      meta: defineMeta({
        label: "Actions",
      }),
      enableSorting: false,
      size: 10,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                className="flex h-8 w-16 p-0"
                variant="ghost"
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        </div>
      ),
    },
  ];

  // nothing added/removed/modified-just pass through
  return getTableColumns<tableType>({ setRowAction, columns });
}
