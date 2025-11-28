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
import { Edit, Ellipsis, UserRoundX } from "lucide-react";

export type ListMembers = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null | undefined;
    active?: boolean;
  };
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
};

export function useContactColumns(
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<ListMembers> | null>
  >,
) {
  const onDeactivate = makeRowAction(setRowAction, "deactivate");
  const onUpdate = makeRowAction(setRowAction, "update");

  const columns: ColumnDef<ListMembers>[] = [
    {
      id: "user.name",
      accessorKey: "user.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.user.name,
      meta: defineMeta({
        label: "Name",
      }),
    },
    {
      id: "user.email",
      accessorKey: "user.email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      meta: defineMeta({
        label: "Email",
      }),
      cell: ({ row }) => row.original.user.email,
    },

    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      meta: defineMeta({
        label: "Role",
      }),
      cell: ({ row }) => row.original.role,
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
            {row.original.role !== "owner" && (
              <DropdownMenuItem
                onSelect={() => onDeactivate(row)}
                variant="destructive"
              >
                <UserRoundX />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // nothing added/removed/modified—just pass through
  return getTableColumns<ListMembers>({ setRowAction, columns });
}
