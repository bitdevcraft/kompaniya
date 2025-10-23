"use client";

import { ButtonGroup } from "@repo/shared-ui/components/common/button-group";
import {
  DataTable,
  DataTableSkeleton,
  DataTableToolbar,
} from "@repo/shared-ui/components/data-table/index";
import { useDataTable } from "@repo/shared-ui/components/ts/data-table/hooks/use-data-table";
import { DataTableRowAction } from "@repo/shared-ui/components/ts/data-table/utils/data-table-columns";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { authClient } from "@/lib/auth/client";
import { SearchParamsSchema } from "@/types/validations";

import { fetchUsers } from "./actions";
import { NewUserButton } from "./new/new-user-button";
import { ListMembers, useContactColumns } from "./users-table-columns";

interface UsersTableProps {
  search: SearchParamsSchema;
}

export function UsersTable(props: UsersTableProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const { data, isLoading } = useQuery({
    queryKey: [
      `users-${activeOrganization?.id}`,
      props.search.page,
      props.search.perPage,
    ],
    queryFn: () =>
      activeOrganization?.id
        ? fetchUsers(
            activeOrganization.id,
            props.search.page,
            props.search.perPage,
          )
        : null,
  });

  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<ListMembers> | null>(null);

  const columns = useContactColumns(setRowAction);

  const { table } = useDataTable({
    data: data?.members ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 1) / props.search.perPage),
    initialState: {
      sorting: [],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <DataTableSkeleton
        cellWidths={[
          "10rem",
          "30rem",
          "10rem",
          "10rem",
          "6rem",
          "6rem",
          "6rem",
        ]}
        columnCount={7}
        filterCount={2}
        shrinkZero
      />
    );
  }

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar hideViewColumns table={table}>
          <ButtonGroup>
            <NewUserButton />
          </ButtonGroup>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
