"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";

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
import { Edit, Ellipsis, Text, Trash2 } from "lucide-react";
import Link from "next/link";

import { getFieldDefinitionColumns } from "@/lib/field-definitions/field-definition-columns";
import { useCustomFieldColumns } from "@/lib/hooks/use-custom-field-columns";
import { useTagOptions } from "@/lib/hooks/use-tag-options";
import { DataTableActionType } from "@/types/data-table-actions";

import type { RecordEntityConfig } from "./types";

export function useRecordEntityColumns<TData extends { id: string }>(
  config: RecordEntityConfig<TData>,
  setRowAction: Dispatch<SetStateAction<DataTableRowAction<TData> | null>>,
): ColumnDef<TData>[] {
  const onDelete = makeRowAction(setRowAction, DataTableActionType.DELETE);
  const onUpdate = makeRowAction(setRowAction, DataTableActionType.UPDATE);
  const customFieldColumns = useCustomFieldColumns<TData>(
    config.tablePreferencesEntityType,
  );
  const tagOptionsQuery = useTagOptions(config.tagType);
  const extraColumns = config.getExtraColumns?.() ?? [];
  const primaryAccessorKey = config.primaryColumn.accessorKey;

  const columns: ColumnDef<TData>[] = [
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
      id: primaryAccessorKey,
      accessorKey: primaryAccessorKey,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={config.primaryColumn.header}
        />
      ),
      cell: ({ row }) => {
        const rawValue = row.getValue(primaryAccessorKey);
        const label =
          rawValue === null || rawValue === undefined ? "" : String(rawValue);

        return (
          <Button asChild size="sm" variant="link">
            <Link href={config.primaryColumn.linkTemplate(row.original.id)}>
              {label}
            </Link>
          </Button>
        );
      },
      meta: {
        label: config.primaryColumn.header,
        placeholder: `Search ${config.primaryColumn.header.toLowerCase()}...`,
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
      enableHiding: false,
    },
    ...extraColumns,
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
  const actionsColumn = columns[columns.length - 1];
  const existingColumnIds = new Set(
    [...columns, ...customColumns]
      .map((column) => column.id)
      .filter(Boolean) as string[],
  );
  const tagOptionsByRelatedType = config.tagType
    ? { [config.tagType]: tagOptionsQuery.data ?? [] }
    : undefined;
  const fieldDefinitionColumns = getFieldDefinitionColumns<TData>(
    config.entityType,
    existingColumnIds,
    {
      tagOptionsByRelatedType,
    },
  );

  return getTableColumns<TData>({
    setRowAction,
    columns: [
      ...columns.slice(0, columns.length - 1),
      ...fieldDefinitionColumns,
      ...customColumns,
      actionsColumn,
    ],
  });
}
