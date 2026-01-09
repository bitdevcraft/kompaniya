"use client";

import {
  DataTable,
  DataTableSkeleton,
} from "@kompaniya/ui-data-table/components/index";
import { useDataTable } from "@kompaniya/ui-data-table/hooks/use-data-table";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { authClient } from "@/lib/auth/client";

import type { EntityTableRow } from "./types";

import { fetchEntitiesMetadata } from "./api";
import { ENTITY_CONFIGS } from "./config";
import { getDataTableColumns } from "./data-table-columns";

export function EntitiesTable() {
  const activeOrganization = authClient.useActiveOrganization();
  const organizationId = activeOrganization?.data?.id ?? "";

  const { data: metadata, isLoading } = useQuery({
    enabled: !!organizationId,
    queryKey: ["entities-metadata", organizationId],
    queryFn: () => fetchEntitiesMetadata(),
  });

  const tableData: EntityTableRow[] = React.useMemo(() => {
    return ENTITY_CONFIGS.map((entity) => {
      const entityMetadata = metadata?.[entity.entityType];
      return {
        slug: entity.slug,
        label: entity.label,
        description: entity.description,
        icon: entity.icon,
        customFieldsCount: entityMetadata?.customFieldsCount ?? 0,
        layoutModifiedAt: entityMetadata?.layoutModifiedAt ?? null,
      };
    });
  }, [metadata]);

  const columns = getDataTableColumns();

  const { table } = useDataTable({
    data: tableData,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "label", desc: false }],
      columnPinning: {},
    },
    getRowId: (row) => row.slug,
  });

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={10} />;
  }

  return (
    <DataTable table={table}>
      <div className="text-sm text-muted-foreground">
        {tableData.length} entities
      </div>
    </DataTable>
  );
}
