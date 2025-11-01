import { OrgEmailDomain } from "@repo/database/schema";
import { Button } from "@repo/shared-ui/components/common/button";
import { Checkbox } from "@repo/shared-ui/components/common/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shared-ui/components/common/dropdown-menu";
import { DataTableColumnHeader } from "@repo/shared-ui/components/data-table/data-table-column-header";
import {
  DataTableRowAction,
  defineMeta,
  getTableColumns,
  makeRowAction,
} from "@repo/shared-ui/components/ts/data-table/utils/data-table-columns";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Ellipsis, Text, UserRoundX } from "lucide-react";

export function useDataTableColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrgEmailDomain> | null>
  >,
) {
  const onDelete = makeRowAction(setRowAction, "delete");
  const onUpdate = makeRowAction(setRowAction, "update");
  const onView = makeRowAction(setRowAction, "view");

  const columns: ColumnDef<OrgEmailDomain>[] = [
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
      id: "email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      meta: defineMeta({
        label: "Email",
        variant: "text",
      }),
      cell: ({ row }) => row.original.email,
      enableColumnFilter: true,
    },

    {
      id: "verified",
      accessorKey: "verified",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verified" />
      ),
      meta: defineMeta({
        label: "Verified",
        variant: "boolean",
      }),
      cell: ({ row }) => row.original.verified,
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
              <UserRoundX />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // nothing added/removed/modified—just pass through
  return getTableColumns<OrgEmailDomain>({ setRowAction, columns });
}
