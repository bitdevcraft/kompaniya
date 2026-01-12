import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
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
import { Ellipsis, Eye, Text } from "lucide-react";

import { DataTableActionType } from "@/types/data-table-actions";

import { tableType } from "./config";

const formatLimit = (value: number | null | undefined) =>
  value === null || value === undefined ? "N/A" : value.toString();

export function useSuperAdminOrganizationColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<tableType> | null>
  >,
) {
  const onView = makeRowAction(setRowAction, DataTableActionType.VIEW);

  const columns: ColumnDef<tableType>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organization" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button onClick={() => onView(row)} size="sm" variant="link">
            {row.original.name}
          </Button>
          {row.original.isSuper ? (
            <Badge className="text-xs" variant="secondary">
              Super
            </Badge>
          ) : null}
        </div>
      ),
      meta: {
        label: "Organization",
        placeholder: "Search organizations...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "slug",
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.slug}</span>
      ),
      meta: {
        label: "Slug",
        placeholder: "Search slugs...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "limits",
      header: "Limits",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <div>Users: {formatLimit(row.original.numberOfUsers)}</div>
          <div>Domains: {formatLimit(row.original.numberOfEmailDomains)}</div>
          <div>Roles: {formatLimit(row.original.numberOfRoles)}</div>
          <div>Teams: {formatLimit(row.original.numberOfTeams)}</div>
        </div>
      ),
      meta: defineMeta({
        label: "Limits",
      }),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <div>Members: {row.original.memberCount}</div>
          <div>Roles: {row.original.roleCount}</div>
          <div>Teams: {row.original.teamCount}</div>
        </div>
      ),
      meta: defineMeta({
        label: "Usage",
      }),
      enableSorting: false,
      enableColumnFilter: false,
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
            <DropdownMenuItem onSelect={() => onView(row)}>
              <Eye />
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return getTableColumns<tableType>({ setRowAction, columns });
}
