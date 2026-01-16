"use client";

import type { Table } from "@tanstack/react-table";

import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@kompaniya/ui-data-table/components/data-table-action-bar";
import { exportTableToCSV } from "@kompaniya/ui-data-table/lib/export";
import { Separator } from "@radix-ui/react-separator";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const actions = ["export", "delete"] as const;

export interface RecordEntityActionBarProps<TData> {
  table: Table<TData>;
  modelEndpoint: string;
  entityLabel: string;
  queryKey?: readonly unknown[];
  actions?: readonly Action[];
}

type Action = (typeof actions)[number];

export function RecordEntityActionBar<TData>({
  table,
  modelEndpoint,
  entityLabel,
  queryKey,
  actions: actionsOverride,
}: RecordEntityActionBarProps<TData>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);
  const enabledActions = actionsOverride ?? actions;
  const tooltipLabel = entityLabel
    ? entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)
    : entityLabel;

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  React.useEffect(() => {
    if (!isPending) router.refresh();
  }, [isPending, router]);

  const onDataRowExport = React.useCallback(() => {
    setCurrentAction("export");
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ["actions"],
        onlySelected: true,
      });
    });
  }, [table]);

  const onDataRowDelete = React.useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;

    if (selectedRows.length === 0) return;

    setCurrentAction("delete");
    startTransition(async () => {
      const ids = selectedRows.map(
        (row) => (row.original as { id: string }).id,
      );

      try {
        await axios.delete(`${modelEndpoint}/bulk`, {
          data: { ids },
          withCredentials: true,
        });
        table.toggleAllRowsSelected(false);
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
        } else {
          toast.error(`Failed to delete ${entityLabel}.`);
        }
      }
    });
  }, [entityLabel, modelEndpoint, queryClient, queryKey, table]);

  const shouldShowExport = enabledActions.includes("export");
  const shouldShowDelete = enabledActions.includes("delete");

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        className="hidden data-[orientation=vertical]:h-5 sm:block"
        orientation="vertical"
      />
      <div className="flex items-center gap-1.5">
        {shouldShowExport ? (
          <DataTableActionBarAction
            isPending={getIsActionPending("export")}
            onClick={onDataRowExport}
            size="icon"
            tooltip={`Export ${tooltipLabel}`}
          >
            <Download />
          </DataTableActionBarAction>
        ) : null}
        {shouldShowDelete ? (
          <DataTableActionBarAction
            isPending={getIsActionPending("delete")}
            onClick={onDataRowDelete}
            size="icon"
            tooltip={`Delete ${tooltipLabel}`}
          >
            <Trash2 />
          </DataTableActionBarAction>
        ) : null}
      </div>
    </DataTableActionBar>
  );
}
