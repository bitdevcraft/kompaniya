"use client";

import { ButtonGroup } from "@kompaniya/ui-common/components/button-group";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import { Label } from "@kompaniya/ui-common/components/label";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableViewOptions,
  DataTableViewToggle,
} from "@kompaniya/ui-data-table/components/index";
import { useDataTable } from "@kompaniya/ui-data-table/hooks/use-data-table";
import { useDataTableViewMode } from "@kompaniya/ui-data-table/hooks/use-data-table-view-mode";
import { DataTableRowAction } from "@kompaniya/ui-data-table/utils/data-table-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React from "react";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { authClient } from "@/lib/auth/client";
import { DataTableActionType } from "@/types/data-table-actions";
import { SearchParamsSchema } from "@/types/validations";

import { model, modelEndpoint, OrganizationModel, tableType } from "./config";
import { OrgDataTableActionBar } from "./data-table-action-bar";
import { DataTableCard } from "./data-table-card";
import { useDataTableColumns } from "./data-table-columns";
import { ImportButton } from "./new/import-button";
import { NewButton } from "./new/new-button";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

const useDataLoad = (
  activeOrganization: OrganizationModel,
  props: OrgDataTableProps,
  qs?: string,
) => {
  return useQuery({
    queryKey: [
      `${model.plural}-${activeOrganization?.data?.id}`,
      props.search.page,
      props.search.perPage,
      JSON.stringify(props.search.filters),
      JSON.stringify(props.search.joinOperator),
      JSON.stringify(props.search.sort),
    ],
    queryFn: async () => {
      const response = await axios.get<{
        data: tableType[];
        pageCount: number;
      }>(`${modelEndpoint}/paginated${qs ? "?" : ""}${qs}`, {
        withCredentials: true,
      });
      return response.data;
    },
  });
};

export function OrgDataTable(props: OrgDataTableProps) {
  const activeOrganization = authClient.useActiveOrganization();

  const [viewMode, setViewMode] = useDataTableViewMode({
    key: `${model.plural}View`,
  });

  const sp = useSearchParams();
  const qs = sp.toString();

  const { data, refetch } = useDataLoad(activeOrganization, props, qs);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<tableType> | null>(null);

  const columns = useDataTableColumns(setRowAction);

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? 1,
    initialState: {
      sorting: [],
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        name: true,
        email: false,
      },
    },
    getRowId: (row) => row.id,
    shallow: false,
  });

  return (
    <>
      <DataTable
        actionBar={<OrgDataTableActionBar table={table} />}
        enableGrid
        gridOptions={{
          columns: ["email", "status"],
          containerClassName: "",
          itemClassName: "",
          emptyState: <div>No Result</div>,

          renderItem: ({ defaultItem, row }) => (
            <DataTableCard
              defaultItem={defaultItem}
              row={row}
              setRowAction={setRowAction}
            />
          ),
        }}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        table={table}
        viewMode={viewMode}
      >
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center w-full">
            <div className="text-xl pl-4 text-nowrap">{model.plural}</div>
            <DataTableAdvancedToolbar hideViewColumns table={table}>
              <div className="flex gap-4">
                <ButtonGroup>
                  <NewButton />
                  <ImportButton />
                </ButtonGroup>
                <DataTableSortList align="start" table={table} />
                <DataTableFilterList
                  align="end"
                  debounceMs={debounceMs}
                  shallow={shallow}
                  table={table}
                  throttleMs={throttleMs}
                />
                <DataTableViewOptions table={table} />
                <DataTableViewToggle
                  onViewModeChange={setViewMode}
                  paramKey={`${model.plural}View`}
                  viewMode={viewMode}
                />
              </div>
            </DataTableAdvancedToolbar>
          </div>
          {viewMode === "grid" && (
            <Label>
              Select All
              <Checkbox
                aria-label="Select all"
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                className="size-6"
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
              />
            </Label>
          )}
        </div>
      </DataTable>

      {rowAction?.variant === DataTableActionType.DELETE && (
        <ConfirmDeleteDialog
          endpoint={`${modelEndpoint}/r/${rowAction.row.original.id}`}
          open={rowAction?.variant === DataTableActionType.DELETE}
          queryKey={[`${model.plural}-${activeOrganization?.data?.id}`]}
          setIsOpen={(open) => {
            console.log("Update");
            if (!open) {
              setRowAction(null);
              refetch();
            }
          }}
        />
      )}
    </>
  );
}
