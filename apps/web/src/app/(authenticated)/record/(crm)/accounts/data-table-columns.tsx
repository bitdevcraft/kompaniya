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
  defineMeta,
  getTableColumns,
  makeRowAction,
} from "@kompaniya/ui-data-table/utils/data-table-columns";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Ellipsis, Text, Trash2 } from "lucide-react";
import Link from "next/link";

import { getFieldDefinitionColumns } from "@/lib/field-definitions/field-definition-columns";
import { useCustomFieldColumns } from "@/lib/hooks/use-custom-field-columns";
import { useTagOptions } from "@/lib/hooks/use-tag-options";
import { DataTableActionType } from "@/types/data-table-actions";

import { tableType } from "./config";

export function useDataTableColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<tableType> | null>
  >,
) {
  const onDelete = makeRowAction(setRowAction, DataTableActionType.DELETE);
  const onUpdate = makeRowAction(setRowAction, DataTableActionType.UPDATE);
  const customFieldColumns = useCustomFieldColumns<tableType>("org_accounts");
  const tagOptionsQuery = useTagOptions("account");

  const columns: ColumnDef<tableType>[] = [
    {
      id: "select",
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
        <Button asChild size={"sm"} variant={"link"}>
          <Link href={`/record/accounts/r/${row.original.id}`}>
            {row.original.name}
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
      enableHiding: false,
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

  const customColumns = customFieldColumns ?? [];
  const actionsColumn = columns[2];
  const existingColumnIds = new Set(
    [...columns, ...customColumns]
      .map((column) => column.id)
      .filter(Boolean) as string[],
  );
  const fieldDefinitionColumns = getFieldDefinitionColumns<tableType>(
    "org_accounts",
    existingColumnIds,
    {
      tagOptionsByRelatedType: {
        account: tagOptionsQuery.data ?? [],
      },
    },
  );

  return getTableColumns<tableType>({
    setRowAction,
    columns: [
      ...columns.slice(0, 2),
      ...fieldDefinitionColumns,
      ...customColumns,
      actionsColumn,
    ],
  });
}
