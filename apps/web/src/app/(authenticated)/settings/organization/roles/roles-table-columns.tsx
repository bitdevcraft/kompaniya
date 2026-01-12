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
import { Edit, Ellipsis, Trash2 } from "lucide-react";

import type { RoleRow } from "./config";

import { PROTECTED_ROLES } from "./config";

export function useRoleColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<RoleRow> | null>
  >,
) {
  const onDelete = makeRowAction(setRowAction, "delete");
  const onEdit = makeRowAction(setRowAction, "edit");

  const columns: ColumnDef<RoleRow>[] = [
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role Name" />
      ),
      cell: ({ row }) => {
        const isProtected = PROTECTED_ROLES.includes(row.original.role);
        return (
          <div className="flex items-center gap-2">
            <span className="capitalize">{row.original.role}</span>
            {isProtected && (
              <Badge className="text-xs" variant="secondary">
                Default
              </Badge>
            )}
          </div>
        );
      },
      meta: defineMeta({
        label: "Role Name",
      }),
    },
    {
      id: "permissions",
      accessorKey: "permission",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Permissions" />
      ),
      cell: ({ row }) => {
        try {
          const permission = row.original.permission;
          const permissions =
            typeof permission === "string"
              ? JSON.parse(permission)
              : permission;
          const count = Object.values(permissions).reduce(
            (acc: number, actions: unknown) =>
              acc + (Array.isArray(actions) ? actions.length : 0),
            0,
          );
          return <span>{count} permissions</span>;
        } catch {
          return <span className="text-muted-foreground">-</span>;
        }
      },
      meta: defineMeta({
        label: "Permissions",
      }),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <span>{date.toLocaleDateString()}</span>;
      },
      meta: defineMeta({
        label: "Created",
      }),
    },
    {
      id: "actions",
      meta: defineMeta({
        label: "Actions",
      }),
      enableSorting: false,
      size: 40,
      cell: ({ row }) => {
        const isProtected = PROTECTED_ROLES.includes(row.original.role);

        if (isProtected) {
          return null;
        }

        return (
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
              <DropdownMenuItem onSelect={() => onEdit(row)}>
                <Edit />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(row)}
                variant="destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return getTableColumns<RoleRow>({ setRowAction, columns });
}

export type { RoleRow };
