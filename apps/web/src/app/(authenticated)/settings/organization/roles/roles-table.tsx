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
import { useRouter } from "next/navigation";
import React from "react";

import { authClient } from "@/lib/auth/client";
import { SearchParamsSchema } from "@/types/validations";

import type { RoleRow } from "./roles-table-columns";

import { fetchRoles, useDeleteRole } from "./actions";
import { NewRoleButton } from "./new/new-role-button";
import { useRoleColumns } from "./roles-table-columns";

interface RolesTableProps {
  search: SearchParamsSchema;
}

export function RolesTable(props: RolesTableProps) {
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      `roles-${activeOrganization?.id}`,
      props.search.page,
      props.search.perPage,
    ],
    queryFn: () =>
      activeOrganization?.id
        ? fetchRoles(
            activeOrganization.id,
            props.search.page,
            props.search.perPage,
          )
        : null,
  });

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<RoleRow> | null>(null);

  const deleteRole = useDeleteRole();

  const columns = useRoleColumns(setRowAction);

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: 1,
    initialState: {
      sorting: [],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  });

  // Handle row actions
  React.useEffect(() => {
    if (!rowAction) return;

    if (rowAction.variant === "edit") {
      router.push(`/settings/organization/roles/${rowAction.row.original.id}`);
    } else if (rowAction.variant === "delete") {
      // Delete is handled via ConfirmDialog below
    }
  }, [rowAction, router]);

  const handleDeleteConfirm = async () => {
    if (!rowAction || rowAction.variant !== "delete") return;
    if (!activeOrganization?.id) return;

    await deleteRole.mutateAsync({
      role: rowAction.row.original.role,
      organizationId: activeOrganization.id,
    });

    await refetch();
    setRowAction(null);
  };

  if (isLoading) {
    return (
      <DataTableSkeleton
        cellWidths={["10rem", "20rem", "10rem", "6rem"]}
        columnCount={4}
        filterCount={0}
        shrinkZero
      />
    );
  }

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar hideViewColumns table={table}>
          <ButtonGroup>
            <NewRoleButton />
          </ButtonGroup>
        </DataTableToolbar>
      </DataTable>

      {rowAction?.variant === "delete" && (
        <ConfirmDialog
          description="This role will be permanently deleted. Users assigned to this role may lose access."
          isOpen={rowAction?.variant === "delete"}
          loading={deleteRole.isPending}
          onCancel={() => {
            setRowAction(null);
          }}
          onConfirm={handleDeleteConfirm}
          setIsOpen={(open) => {
            if (!open) setRowAction(null);
          }}
          title={`Delete role "${rowAction.row.original.role}"?`}
        />
      )}
    </>
  );
}
