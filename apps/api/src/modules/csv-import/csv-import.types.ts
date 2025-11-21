import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core';

export type ColumnMapping = Record<string, string | null>;

export type CsvImportColumn = {
  key: string;
  label: string;
  type: CsvImportColumnType;
  description?: string;
};

export type CsvImportColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'string[]'
  | 'boolean'
  | 'json';

export type CsvImportTableConfig = {
  id: string;
  label: string;
  description?: string;
  table: SupportedTable;
  columns: CsvImportColumn[];
};

export type SupportedTable = AnyPgTable & {
  organizationId: AnyPgColumn;
  id: AnyPgColumn;
};
