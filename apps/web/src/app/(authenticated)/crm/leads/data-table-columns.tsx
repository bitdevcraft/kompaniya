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
  const customFieldColumns = useCustomFieldColumns<tableType>("org_leads");
  const tagOptionsQuery = useTagOptions("lead");

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
      size: 40,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Button asChild size={"sm"} variant={"link"}>
          <Link href={`/crm/leads/r/${row.original.id}`}>
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
      id: "email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <p>{row.original.email}</p>,
      meta: {
        label: "Email",
        placeholder: "Search emails...",
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
    },
  ];

  const customColumns = customFieldColumns ?? [];
  const actionsColumn = columns[3];
  const existingColumnIds = new Set(
    [...columns, ...customColumns]
      .map((column) => column.id)
      .filter(Boolean) as string[],
  );
  const fieldDefinitionColumns = getFieldDefinitionColumns<tableType>(
    "org_leads",
    existingColumnIds,
    {
      tagOptionsByRelatedType: {
        lead: tagOptionsQuery.data ?? [],
      },
    },
  );

  return getTableColumns<tableType>({
    setRowAction,
    columns: [
      ...columns.slice(0, 3),
      ...fieldDefinitionColumns,
      ...customColumns,
      actionsColumn,
    ],
  });
}
