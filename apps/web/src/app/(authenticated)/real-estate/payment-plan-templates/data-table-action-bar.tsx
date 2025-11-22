"use client";

import { Separator } from "@radix-ui/react-separator";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@repo/shared-ui/components/data-table/data-table-action-bar";
import { exportTableToCSV } from "@repo/shared-ui/components/ts/data-table/lib/export";
import { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import React from "react";

import { tableType } from "./config";

type Action = "export";

interface OrgDataTableActionBarProps {
  table: Table<tableType>;
}

export function OrgDataTableActionBar({ table }: OrgDataTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction],
  );

  const onDataRowExport = React.useCallback(() => {
    setCurrentAction("export");
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ["actions"],
        onlySelected: true,
      });
    });
  }, [table]);

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
            tooltip="Export templates"
          >
            <Download />
          </DataTableActionBarAction>
        </div>
      </DataTableActionBar>
    </>
  );
}
