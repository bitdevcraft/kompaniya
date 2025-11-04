"use client";

import { Separator } from "@radix-ui/react-separator";
import { OrgContact } from "@repo/database/schema";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@repo/shared-ui/components/data-table/data-table-action-bar";
import { exportTableToCSV } from "@repo/shared-ui/components/ts/data-table/lib/export";
import { Table } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = ["export", "delete"] as const;

type Action = (typeof actions)[number];

interface OrgDataTableActionBarProps {
  table: Table<OrgContact>;
}

export function OrgDataTableActionBar({ table }: OrgDataTableActionBarProps) {
  const router = useRouter();
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
        excludeColumns: ["select", "actions"],
        onlySelected: true,
      });
    });
  }, [table]);

  const onDataRowDelete = React.useCallback(() => {
    setCurrentAction("delete");
    startTransition(async () => {
      table.toggleAllRowsSelected(false);
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
            disabled
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
