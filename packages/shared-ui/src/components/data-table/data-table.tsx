import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/shared-ui/components/common/table";
import { cn } from "@repo/shared-ui/lib/utils";
import {
  flexRender,
  type Cell as TanstackCell,
  type Column as TanstackColumn,
  type Row as TanstackRow,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "./data-table-pagination";
import { getCommonPinningStyles } from "./lib/data-table";

export interface DataTableGridCell<TData> {
  cell?: TanstackCell<TData, unknown>;
  column: TanstackColumn<TData, unknown>;
  value: React.ReactNode;
}

export interface DataTableGridOptions<TData> {
  columns?: string[];
  containerClassName?: string;
  emptyState?: React.ReactNode;
  itemClassName?: string;
  renderItem?: (context: DataTableGridRenderContext<TData>) => React.ReactNode;
}

export interface DataTableGridRenderContext<TData> {
  cells: DataTableGridCell<TData>[];
  columns: TanstackColumn<TData, unknown>[];
  defaultItem: React.ReactNode;
  row: TanstackRow<TData>;
}

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  paginationClassName?: string;
  pageSizeOptions?: number[];
  hideFirstAndLastPageButton?: boolean;
  enableGrid?: boolean;
  gridOptions?: DataTableGridOptions<TData>;
  gridView?: boolean;
  viewMode?: "table" | "grid";
}

export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  paginationClassName,
  pageSizeOptions,
  hideFirstAndLastPageButton = false,
  enableGrid = false,
  gridOptions,
  gridView,
  viewMode,
  ...props
}: DataTableProps<TData>) {
  const resolvedViewMode = React.useMemo<"table" | "grid">(() => {
    if (!enableGrid) {
      return "table";
    }

    if (viewMode === "table" || viewMode === "grid") {
      return viewMode;
    }

    if (typeof gridView === "boolean") {
      return gridView ? "grid" : "table";
    }

    return "table";
  }, [enableGrid, gridView, viewMode]);

  const gridColumns = React.useMemo(() => {
    const availableColumns = table.getAllLeafColumns();

    if (!gridOptions?.columns?.length) {
      return availableColumns.filter((column) => column.getIsVisible());
    }

    const requestedColumns = new Set(gridOptions.columns);

    return availableColumns.filter(
      (column) => requestedColumns.has(column.id) && column.getIsVisible(),
    );
  }, [gridOptions, table]);

  const emptyGridState = gridOptions?.emptyState ?? "No results.";

  const renderGridItem = (row: TanstackRow<TData>) => {
    const cellMap = new Map(
      row.getAllCells().map((cell) => [cell.column.id, cell] as const),
    );

    const cells: DataTableGridCell<TData>[] = gridColumns.map((column) => {
      const cell = cellMap.get(column.id);

      return {
        cell,
        column,
        value:
          cell != null
            ? flexRender(column.columnDef.cell, cell.getContext())
            : null,
      };
    });

    const defaultItem = (
      <div className="flex flex-col gap-3">
        {cells.map(({ column, value }) => (
          <div className="flex flex-col gap-1" key={column.id}>
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {column.columnDef.meta?.label ?? column.id}
            </span>
            <div className="text-sm text-foreground">{value}</div>
          </div>
        ))}
      </div>
    );

    const customItem = gridOptions?.renderItem?.({
      cells,
      columns: gridColumns,
      defaultItem,
      row,
    });

    return customItem ?? defaultItem;
  };

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      <div className="w-full p-2 border rounded-md bg-background shadow">
        {children}
      </div>

      {enableGrid && resolvedViewMode === "grid" ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3",
            gridOptions?.containerClassName,
          )}
        >
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                className={cn(gridOptions?.itemClassName)}
                data-state={row.getIsSelected() ? "selected" : undefined}
                key={row.id}
              >
                {renderGridItem(row)}
              </div>
            ))
          ) : (
            <div className="col-span-full flex h-24 items-center justify-center text-sm text-muted-foreground">
              {emptyGridState}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border bg-background">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      colSpan={header.colSpan}
                      key={header.id}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={table.getAllColumns().length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination
          className={paginationClassName}
          hideFirstAndLastPageButton={hideFirstAndLastPageButton}
          pageSizeOptions={pageSizeOptions}
          table={table}
        />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
