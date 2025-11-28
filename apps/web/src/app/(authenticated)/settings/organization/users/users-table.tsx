"use client";

import { ButtonGroup } from "@kompaniya/ui-common/components/button-group";
import { ConfirmDialog } from "@kompaniya/ui-common/components/dialog-confirm";
import {
  DataTable,
  DataTableSkeleton,
  DataTableToolbar,
} from "@kompaniya/ui-data-table/components/index";
import { useDataTable } from "@kompaniya/ui-data-table/hooks/use-data-table";
import { DataTableRowAction } from "@kompaniya/ui-data-table/utils/data-table-columns";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { authClient } from "@/lib/auth/client";
import { SearchParamsSchema } from "@/types/validations";

import { fetchUsers, useDeactivateUser } from "./actions";
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

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<ListMembers> | null>(null);

  const deactiveUser = useDeactivateUser();

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

      {rowAction?.variant === "deactivate" && (
        <ConfirmDialog
          description="This user can't login after deactivated"
          isOpen={rowAction?.variant === "deactivate"}
          loading={deactiveUser.isPending}
          onCancel={() => {
            setRowAction(null);
          }}
          onConfirm={async () => {
            deactiveUser.mutate(rowAction?.row.original.user.id);
          }}
          setIsOpen={(open) => {
            if (!open) setRowAction(null);
          }}
          title="Deactive User?"
        ></ConfirmDialog>
      )}
    </>
  );
}
