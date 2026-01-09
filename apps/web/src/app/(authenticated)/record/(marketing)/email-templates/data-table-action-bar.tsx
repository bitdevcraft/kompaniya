"use client";

import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@kompaniya/ui-data-table/components/data-table-action-bar";
import { exportTableToCSV } from "@kompaniya/ui-data-table/lib/export";
import { Separator } from "@radix-ui/react-separator";
import { useQueryClient } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";
import axios from "axios";
import { Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";

import { model, modelEndpoint, tableType } from "./config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = ["export", "delete"] as const;

type Action = (typeof actions)[number];

interface OrgDataTableActionBarProps {
  table: Table<tableType>;
}

export function OrgDataTableActionBar({ table }: OrgDataTableActionBarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeOrganization = authClient.useActiveOrganization();
  const organizationId = activeOrganization?.data?.id;
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

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
      const ids = selectedRows.map((row) => row.original.id);

      try {
        await axios.delete(`${modelEndpoint}/bulk`, {
          data: { ids },
          withCredentials: true,
        });
        await queryClient.invalidateQueries({
          queryKey: [`${model.plural}-${organizationId}`],
        });
        table.toggleAllRowsSelected(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || error.message);
        } else {
          toast.error("Failed to delete records.");
        }
      }
    });
  }, [organizationId, queryClient, table]);

  return (
    <>
      <DataTableActionBar table={table} visible={rows.length > 0}>
        <DataTableActionBarSelection table={table} />
        <Separator
          className="hidden data-[orientation=vertical]:h-5 sm:block"
          orientation="vertical"
        />
        <div className="flex items-center gap-1.5">
          <DataTableActionBarAction
            isPending={getIsActionPending("export")}
            onClick={onDataRowExport}
            size="icon"
            tooltip="Export Contacts"
          >
            <Download />
          </DataTableActionBarAction>
          <DataTableActionBarAction
            isPending={getIsActionPending("delete")}
            onClick={onDataRowDelete}
            size="icon"
            tooltip="Delete Contacts"
          >
            <Trash2 />
          </DataTableActionBarAction>
        </div>
      </DataTableActionBar>
    </>
  );
}
