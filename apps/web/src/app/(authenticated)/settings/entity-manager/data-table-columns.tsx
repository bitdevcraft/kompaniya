"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@kompaniya/ui-common/components/button";
import { DataTableColumnHeader } from "@kompaniya/ui-data-table/components/data-table-column-header";
import { defineMeta } from "@kompaniya/ui-data-table/utils/data-table-columns";
import Link from "next/link";

import type { EntityTableRow } from "./types";

import { getIconComponent } from "./icon-map";

export function getDataTableColumns(): ColumnDef<EntityTableRow>[] {
  return [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => {
        const IconComponent = getIconComponent(row.original.icon);
        return (
          <div className="flex size-8 items-center justify-center">
            <IconComponent className="size-4 text-muted-foreground" />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      id: "label",
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Button asChild size="sm" variant="link">
          <Link href={`/settings/entity-manager/${row.original.slug}`}>
            {row.original.label}
          </Link>
        </Button>
      ),
      meta: defineMeta({
        label: "Name",
        placeholder: "Search entities...",
        variant: "text",
      }),
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: "description",
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description}
        </span>
      ),
      meta: defineMeta({
        label: "Description",
        placeholder: "Search descriptions...",
        variant: "text",
      }),
      enableColumnFilter: true,
    },
    {
      id: "customFieldsCount",
      accessorKey: "customFieldsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Custom Fields" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.customFieldsCount}</span>
      ),
      meta: defineMeta({
        label: "Custom Fields",
        variant: "number",
      }),
      enableSorting: true,
    },
    {
      id: "layoutModifiedAt",
      accessorKey: "layoutModifiedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Layout Modified" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.layoutModifiedAt
            ? new Date(row.original.layoutModifiedAt).toLocaleDateString()
            : "-"}
        </span>
      ),
      meta: defineMeta({
        label: "Layout Modified",
        variant: "date",
      }),
      enableSorting: true,
    },
  ];
}
