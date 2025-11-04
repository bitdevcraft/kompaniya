"use client";

import { OrgLead } from "@repo/database/schema";
import { ButtonGroup } from "@repo/shared-ui/components/common/button-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/shared-ui/components/common/toggle-group";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
} from "@repo/shared-ui/components/data-table/index";
import { useDataTable } from "@repo/shared-ui/components/ts/data-table/hooks/use-data-table";
import { DataTableRowAction } from "@repo/shared-ui/components/ts/data-table/utils/data-table-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";
import { SearchParamsSchema } from "@/types/validations";

import { OrgDataTableActionBar } from "./data-table-action-bar";
import { DataTableCard } from "./data-table-card";
import { useDataTableColumns } from "./data-table-columns";
import { ImportButton } from "./new/import-button";
import { NewButton } from "./new/new-button";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

const model = {
  name: "lead",
  plural: "leads",
};

type OrganizationModel = ReturnType<typeof authClient.useActiveOrganization>;

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
        data: OrgLead[];
        pageCount: number;
      }>(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/${model.name}/paginated${qs ? "?" : ""}${qs}`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    },
  });
};

export function OrgDataTable(props: OrgDataTableProps) {
  const activeOrganization = authClient.useActiveOrganization();

  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  const sp = useSearchParams();
  const qs = sp.toString();

  const { data } = useDataLoad(activeOrganization, props, qs);

  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<OrgLead> | null>(null);

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
      <DataTable
        actionBar={<OrgDataTableActionBar table={table} />}
        enableGrid
        gridOptions={{
          columns: ["email", "phone"],
          containerClassName: "",
          itemClassName: "",
          emptyState: <div />,

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
        <div className="flex items-center">
          <div className="text-xl  pl-4">Leads</div>
          <DataTableAdvancedToolbar hideViewColumns table={table}>
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
            <ToggleGroup
              onValueChange={(value) => {
                if (value === "table" || value === "grid") {
                  setViewMode(value);
                }
              }}
              size="sm"
              type="single"
              value={viewMode}
              variant="outline"
            >
              <ToggleGroupItem aria-label="Table view" value="table">
                <List className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem aria-label="Grid view" value="grid">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </DataTableAdvancedToolbar>
        </div>
      </DataTable>
    </>
  );
}
