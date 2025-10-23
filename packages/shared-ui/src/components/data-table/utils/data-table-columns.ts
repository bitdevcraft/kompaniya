import type { ColumnDef, Row } from "@tanstack/react-table";

import * as React from "react";

export type DataTableRowAction<T> = { row: Row<T>; variant: RowActionVariant };
export type RowActionVariant = string; // e.g. "clone" | "edit" | "delete"

export interface TableColumnsProps<T> {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<T> | null>
  >;
  columns: ColumnDef<T, unknown>[];
}

export function getTableColumns<T>({
  columns,
}: TableColumnsProps<T>): ColumnDef<T, unknown>[] {
  return columns;
}

export const makeRowAction =
  <T>(
    setRowAction: TableColumnsProps<T>["setRowAction"],
    variant: RowActionVariant,
  ) =>
  (row: Row<T>) =>
    setRowAction({ row, variant });

export const defineMeta = <M>(meta: M) => meta;
