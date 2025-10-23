import { Button } from "@repo/shared-ui/components/common/button";
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
import { Ellipsis } from "lucide-react";

export type ListMembers = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null | undefined;
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
  const onRemove = makeRowAction(setRowAction, "remove");

  const columns: ColumnDef<ListMembers>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.user.name,
      meta: defineMeta({
        label: "Name",
      }),
    },
    {
      id: "email",
      accessorKey: "email",
      meta: defineMeta({
        label: "Email",
      }),
      cell: ({ row }) => row.original.user.email,
    },
    {
      id: "role",
      accessorKey: "role",
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
            <DropdownMenuItem onSelect={() => onRemove(row)}>
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // nothing added/removed/modified—just pass through
  return getTableColumns<ListMembers>({ setRowAction, columns });
}
