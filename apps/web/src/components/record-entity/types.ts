import type { ExtendedColumnSort } from "@kompaniya/ui-data-table/types/data-table";
import type { ColumnDef, TableState } from "@tanstack/react-table";
import type { ReactNode } from "react";

export interface RecordEntityConfig<TData extends { id: string }> {
  entityType: string;
  model: RecordEntityModel;
  modelEndpoint: string;
  dictTranslation: string;
  tablePreferencesEntityType: string;
  basePath: string;
  recordPath: (id: string) => string;
  primaryColumn: {
    accessorKey: keyof TData & string;
    header: string;
    linkTemplate: (id: string) => string;
  };
  tableInitialState?: RecordEntityTableInitialState<TData>;
  tagType?: string;
  gridCardColumns?: string[];
  tableTitle?: ReactNode;
  renderTitle?: (row: TData) => ReactNode;
  renderCardSubtitle?: (row: TData) => ReactNode;
  getExtraColumns?: () => ColumnDef<TData>[];
}

export type RecordEntityModel = {
  name: string;
  plural: string;
  label?: string;
};

export type RecordEntityTableInitialState<TData> = Omit<
  Partial<TableState>,
  "sorting"
> & {
  sorting?: ExtendedColumnSort<TData>[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface RecordEntityViewPageConfig<TData extends { id: string }> {
  entityType: string;
  modelEndpoint: string;
  basePath: string;
  model?: RecordEntityModel;
  queryKey: (recordId: string) => readonly unknown[];
}
