"use client";

import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSkeleton,
  DataTableSortList,
} from "@kompaniya/ui-data-table/components/index";
import { useDataTable } from "@kompaniya/ui-data-table/hooks/use-data-table";
import { DataTableRowAction } from "@kompaniya/ui-data-table/utils/data-table-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { DataTableActionType } from "@/types/data-table-actions";
import { SearchParamsSchema } from "@/types/validations";

import { modelEndpoint, tableType } from "./config";
import { useSuperAdminOrganizationColumns } from "./super-admin-organizations-table-columns";

interface SuperAdminOrganizationsTableProps {
  search: SearchParamsSchema;
}

const useDataLoad = (props: SuperAdminOrganizationsTableProps, qs?: string) =>
  useQuery({
    queryKey: [
      "super-admin-organizations",
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
      }>(`${modelEndpoint}${qs ? "?" : ""}${qs}`, {
        withCredentials: true,
      });

      return response.data;
    },
  });

export function SuperAdminOrganizationsTable(
  props: SuperAdminOrganizationsTableProps,
) {
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();

  const { data, isLoading } = useDataLoad(props, qs);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<tableType> | null>(null);

  const columns = useSuperAdminOrganizationColumns(setRowAction);

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

  React.useEffect(() => {
    if (!rowAction) return;

    if (rowAction.variant === DataTableActionType.VIEW) {
      router.push(
        `/settings/super-admin/organizations/${rowAction.row.original.id}`,
      );
    }
  }, [rowAction, router]);

  if (isLoading) {
    return (
      <DataTableSkeleton
        cellWidths={["16rem", "16rem", "18rem", "14rem", "4rem"]}
        columnCount={5}
        filterCount={2}
        shrinkZero
      />
    );
  }

  return (
    <DataTable table={table}>
      <div className="flex items-center w-full">
        <div className="text-xl pl-4 text-nowrap">Organizations</div>
        <DataTableAdvancedToolbar hideViewColumns table={table}>
          <div className="flex gap-4">
            <DataTableSortList align="start" table={table} />
            <DataTableFilterList
              align="end"
              debounceMs={debounceMs}
              shallow={shallow}
              table={table}
              throttleMs={throttleMs}
            />
          </div>
        </DataTableAdvancedToolbar>
      </div>
    </DataTable>
  );
}
