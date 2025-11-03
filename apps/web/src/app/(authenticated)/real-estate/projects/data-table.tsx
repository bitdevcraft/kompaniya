"use client";

import { OrgRealEstateProject } from "@repo/database/schema";
import { ButtonGroup } from "@repo/shared-ui/components/common/button-group";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
} from "@repo/shared-ui/components/data-table/index";
import { useDataTable } from "@repo/shared-ui/components/ts/data-table/hooks/use-data-table";
import { DataTableRowAction } from "@repo/shared-ui/components/ts/data-table/utils/data-table-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React from "react";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";
import { SearchParamsSchema } from "@/types/validations";

import { useDataTableColumns } from "./data-table-columns";
import { NewButton } from "./new/new-button";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

export function OrgDataTable(props: OrgDataTableProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const sp = useSearchParams();
  const qs = sp.toString();

  const { data } = useQuery({
    queryKey: [
      `real-estate-projects-${activeOrganization?.id}`,
      props.search.page,
      props.search.perPage,
      JSON.stringify(props.search.filters),
      JSON.stringify(props.search.joinOperator),
      JSON.stringify(props.search.sort),
    ],
    queryFn: async () => {
      const response = await axios.get<{
        data: OrgRealEstateProject[];
        pageCount: number;
      }>(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/real-estate-project/paginated${qs ? "?" : ""}${qs}`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    },
  });

  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<OrgRealEstateProject> | null>(null);

  const columns = useDataTableColumns(setRowAction);

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

  return (
    <>
      <DataTable pageSizeOptions={[10, 20, 50, 100, 200]} table={table}>
        <div className="flex items-center">
          <div className="text-xl  pl-4"></div>
          <DataTableAdvancedToolbar hideViewColumns table={table}>
            <ButtonGroup>
              <NewButton />
            </ButtonGroup>
            <DataTableFilterList
              align="end"
              debounceMs={debounceMs}
              shallow={shallow}
              table={table}
              throttleMs={throttleMs}
            />
          </DataTableAdvancedToolbar>
        </div>
      </DataTable>
    </>
  );
}
