"use client";

import type { Row, Table } from "@tanstack/react-table";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import { ButtonGroup } from "@kompaniya/ui-common/components/button-group";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import { Label } from "@kompaniya/ui-common/components/label";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSkeleton,
  DataTableSortList,
  DataTableViewOptions,
  DataTableViewToggle,
} from "@kompaniya/ui-data-table/components/index";
import { useDataTable } from "@kompaniya/ui-data-table/hooks/use-data-table";
import {
  DataTableViewMode,
  useDataTableViewMode,
} from "@kompaniya/ui-data-table/hooks/use-data-table-view-mode";
import { DataTableRowAction } from "@kompaniya/ui-data-table/utils/data-table-columns";
import { convertCase } from "@repo/shared/utils";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React from "react";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { authClient } from "@/lib/auth/client";
import { useTablePreferences } from "@/lib/hooks/use-table-preferences";
import { DataTableActionType } from "@/types/data-table-actions";
import { SearchParamsSchema } from "@/types/validations";

import type { RecordEntityConfig } from "./types";

import { RecordEntityActionBar } from "./record-entity-data-table-action-bar";
import { RecordEntityCard } from "./record-entity-data-table-card";
import { useRecordEntityColumns } from "./record-entity-data-table-column";

export interface RecordEntityActionBarRenderProps<TData> {
  table: Table<TData>;
  queryKey: readonly unknown[];
  modelEndpoint: string;
  entityLabel: string;
}

export interface RecordEntityCardRenderProps<TData> {
  row: Row<TData>;
  defaultItem?: ReactNode;
  setRowAction: Dispatch<SetStateAction<DataTableRowAction<TData> | null>>;
}

export interface RecordEntityHeaderRenderProps<TData> {
  table: Table<TData>;
  viewMode: DataTableViewMode;
  setViewMode: (
    value:
      | DataTableViewMode
      | ((previous: DataTableViewMode) => DataTableViewMode),
  ) => void;
  debounceMs: number;
  throttleMs: number;
  shallow: boolean;
  tableTitle: ReactNode;
  newButton?: ReactNode;
  importButton?: ReactNode;
}

export interface RecordEntityTableProps<TData extends { id: string }> {
  config: RecordEntityConfig<TData>;
  search: SearchParamsSchema;
  actionBar?: ReactNode;
  newButton?: ReactNode;
  importButton?: ReactNode;
  renderCard?: (props: RecordEntityCardRenderProps<TData>) => ReactNode;
  renderHeader?: (props: RecordEntityHeaderRenderProps<TData>) => ReactNode;
  renderActionBar?: (
    props: RecordEntityActionBarRenderProps<TData>,
  ) => ReactNode;
}

export function RecordEntityDataTable<TData extends { id: string }>({
  config,
  search,
  actionBar,
  newButton,
  importButton,
  renderCard,
  renderHeader,
  renderActionBar,
}: RecordEntityTableProps<TData>) {
  const activeOrganization = authClient.useActiveOrganization();
  const [viewMode, setViewMode] = useDataTableViewMode({
    key: `${config.model.plural}View`,
  });

  const sp = useSearchParams();
  const qs = sp.toString();

  const queryKey = React.useMemo(
    () => [
      `${config.model.plural}-${activeOrganization?.data?.id}`,
      search.page,
      search.perPage,
      JSON.stringify(search.filters),
      JSON.stringify(search.joinOperator),
      JSON.stringify(search.sort),
    ],
    [
      activeOrganization?.data?.id,
      config.model.plural,
      search.filters,
      search.joinOperator,
      search.page,
      search.perPage,
      search.sort,
    ],
  );

  const { data, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<{
        data: TData[];
        pageCount: number;
      }>(`${config.modelEndpoint}/paginated${qs ? "?" : ""}${qs}`, {
        withCredentials: true,
      });
      return response.data;
    },
  });

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<TData> | null>(null);

  const columns = useRecordEntityColumns(config, setRowAction);

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? 1,
    initialState: {
      sorting: [],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
    shallow: false,
  });

  const { isReady } = useTablePreferences({
    entityType: config.tablePreferencesEntityType,
    table,
    organizationId: activeOrganization?.data?.id,
    lockVisibleColumns: [config.primaryColumn.accessorKey],
  });

  const customFieldsFetching = useIsFetching({
    queryKey: ["custom-field-definitions", config.tablePreferencesEntityType],
  });

  const isTableSetupLoading = !isReady || customFieldsFetching > 0;
  const tableTitle =
    config.tableTitle ?? convertCase(config.model.plural, "kebab", "title");
  const baseQueryKey = [
    `${config.model.plural}-${activeOrganization?.data?.id}`,
  ];
  const resolvedCardRenderer =
    renderCard ??
    ((props: RecordEntityCardRenderProps<TData>) => (
      <RecordEntityCard
        {...props}
        renderSubtitle={config.renderCardSubtitle}
        renderTitle={
          config.renderTitle ??
          ((row) => {
            const rawValue =
              row[config.primaryColumn.accessorKey as keyof TData];
            return rawValue === null || rawValue === undefined
              ? ""
              : String(rawValue);
          })
        }
      />
    ));

  const resolvedActionBar = renderActionBar
    ? renderActionBar({
        table,
        queryKey,
        modelEndpoint: config.modelEndpoint,
        entityLabel: config.model.plural,
      })
    : (actionBar ?? (
        <RecordEntityActionBar
          entityLabel={config.model.plural}
          modelEndpoint={config.modelEndpoint}
          queryKey={queryKey}
          table={table}
        />
      ));

  const defaultHeader = (
    <div className="flex flex-col items-end gap-4">
      <div className="flex items-center w-full">
        <div className="text-xl pl-4 text-nowrap">{tableTitle}</div>
        <DataTableAdvancedToolbar hideViewColumns table={table}>
          <div className="flex gap-4">
            {newButton || importButton ? (
              <ButtonGroup>
                {newButton}
                {importButton}
              </ButtonGroup>
            ) : null}
            <DataTableSortList align="start" table={table} />
            <DataTableFilterList
              align="end"
              debounceMs={debounceMs}
              shallow={shallow}
              table={table}
              throttleMs={throttleMs}
            />
            <DataTableViewToggle
              onViewModeChange={setViewMode}
              paramKey={`${config.model.plural}View`}
              viewMode={viewMode}
            />
            <DataTableViewOptions table={table} />
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
  );

  if (isTableSetupLoading) {
    return <DataTableSkeleton columnCount={6} filterCount={2} shrinkZero />;
  }

  return (
    <>
      <DataTable
        actionBar={resolvedActionBar}
        enableGrid
        gridOptions={{
          columns: config.gridCardColumns ?? [],
          containerClassName: "",
          itemClassName: "",
          emptyState: <div>No Result</div>,
          renderItem: ({ defaultItem, row }) =>
            resolvedCardRenderer({ defaultItem, row, setRowAction }),
        }}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        table={table}
        viewMode={viewMode}
      >
        {renderHeader
          ? renderHeader({
              table,
              viewMode,
              setViewMode,
              debounceMs,
              throttleMs,
              shallow,
              tableTitle,
              newButton,
              importButton,
            })
          : defaultHeader}
      </DataTable>

      {rowAction?.variant === DataTableActionType.DELETE && (
        <ConfirmDeleteDialog
          endpoint={`${config.modelEndpoint}/r/${rowAction.row.original.id}`}
          open={rowAction?.variant === DataTableActionType.DELETE}
          queryKey={baseQueryKey}
          setIsOpen={(open) => {
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
