"use client";

import type { UploadResult } from "@uppy/core";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@kompaniya/ui-common/components/alert";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";
import { ArrowDownToLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FileUpload } from "@/components/file-upload";
import { env } from "@/env/client";

const OMIT_VALUE = "__csv_import_omit__";

type CsvImportColumn = {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "string[]" | "boolean" | "json";
  description?: string;
};

type CsvImportOptionsResponse = {
  tables: CsvImportTable[];
};

type CsvImportTable = {
  id: string;
  label: string;
  description?: string;
  columns: CsvImportColumn[];
};

type CsvPreviewResponse = {
  fileId: string;
  fileName?: string;
  headers: string[];
  rows: string[][];
};

// Mapping row component - renders a row in the preview table with dropdowns for field mapping
interface MappingRowProps {
  csvHeaders: string[];
  tableColumns: CsvImportColumn[];
  columnMapping: Record<string, string | null>;
  onMappingChange: (csvHeader: string, tableFieldKey: string) => void;
}

type SubmitState =
  | { state: "idle" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export default function CsvImporter() {
  const [tables, setTables] = useState<CsvImportTable[]>([]);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [tablesLoading, setTablesLoading] = useState(true);

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [columnMapping, setColumnMapping] = useState<
    Record<string, string | null>
  >({});
  const [submitState, setSubmitState] = useState<SubmitState>({
    state: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const hasMappedColumns = useMemo(
    () => Object.values(columnMapping).some((value) => value !== null),
    [columnMapping],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setTablesLoading(true);
      setTablesError(null);

      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/options`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            payload?.message ?? "Unable to load CSV import options.",
          );
        }

        const data = (await response.json()) as CsvImportOptionsResponse;
        if (cancelled) {
          return;
        }

        setTables(data.tables);
        if (data.tables.length > 0) {
          setSelectedTableId(data.tables[0].id);
        }
      } catch (error) {
        if (!cancelled) {
          setTablesError(
            error instanceof Error ? error.message : String(error),
          );
        }
      } finally {
        if (!cancelled) {
          setTablesLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!preview || !selectedTable) {
      setColumnMapping({});
      return;
    }

    setColumnMapping(
      buildInitialMapping(selectedTable.columns, preview.headers),
    );
  }, [preview, preview?.fileId, selectedTable]);

  const handleUploadComplete = useCallback(
    async (
      result: UploadResult<Record<string, string>, Record<string, unknown>>,
    ) => {
      const uploaded = result.successful ? result.successful[0] : null;
      if (!uploaded || !uploaded.uploadURL) {
        setPreviewError("Upload did not return a valid file reference.");
        return;
      }

      setPreview(null);
      setPreviewError(null);
      setSubmitState({ state: "idle" });
      setPreviewLoading(true);

      try {
        const uploadUrl = new URL(uploaded.uploadURL);
        const segments = uploadUrl.pathname.split("/").filter(Boolean);
        const fileId = segments.pop();

        if (!fileId) {
          throw new Error("Unable to determine uploaded file identifier.");
        }

        const response = await fetch(
          `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/preview`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileId }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(payload?.message ?? "Unable to read CSV preview.");
        }

        const data = (await response.json()) as CsvPreviewResponse;
        setPreview(data);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : String(error));
      } finally {
        setPreviewLoading(false);
      }
    },
    [],
  );

  const handleMappingChange = useCallback(
    (csvHeader: string, tableFieldKey: string) => {
      setColumnMapping((previous) => {
        const newMapping = { ...previous };
        // Clear any existing mapping for this table field (one-to-one mapping)
        for (const [key, value] of Object.entries(newMapping)) {
          if (key === tableFieldKey && tableFieldKey !== OMIT_VALUE) {
            continue; // We'll set this one below
          }
          if (value === csvHeader) {
            newMapping[key] = null;
          }
        }
        // Set the new mapping
        newMapping[tableFieldKey] =
          tableFieldKey === OMIT_VALUE ? null : csvHeader;
        return newMapping;
      });
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!preview || !selectedTable) {
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ state: "idle" });

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableId: selectedTable.id,
            fileId: preview.fileId,
            mapping: columnMapping,
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message ?? "Failed to queue CSV import.");
      }

      setSubmitState({
        state: "success",
        message: "Import queued successfully.",
      });
    } catch (error) {
      setSubmitState({
        state: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [columnMapping, preview, selectedTable]);
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Upload a CSV file. The first three rows will be used for preview and
            mapping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            allowedFileTypes={[".csv", "text/csv"]}
            autoProceed
            maxNumberOfFiles={1}
            note="Only CSV files are supported. Uploading a new file replaces the current preview."
            onComplete={handleUploadComplete}
          />
          {previewLoading && (
            <p className="text-sm text-muted-foreground mt-4">
              Generating preview&hellip;
            </p>
          )}
          {previewError && (
            <Alert className="mt-4" variant="destructive">
              <AlertTitle>Preview error</AlertTitle>
              <AlertDescription>{previewError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mapping</CardTitle>
          <CardDescription>
            Choose the destination table and map CSV columns to the available
            fields in the preview table below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {tablesLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading tables&hellip;
            </p>
          ) : tablesError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load configuration</AlertTitle>
              <AlertDescription>{tablesError}</AlertDescription>
            </Alert>
          ) : tables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tables available for CSV import.
            </p>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Destination table</label>
                <Select
                  onValueChange={(value) => setSelectedTableId(value)}
                  value={selectedTableId ?? undefined}
                >
                  <SelectTrigger className="w-full justify-between">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTable?.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedTable.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  disabled={
                    !preview ||
                    !selectedTable ||
                    !hasMappedColumns ||
                    isSubmitting
                  }
                  loading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Queue import
                </Button>
                {submitState.state === "success" && (
                  <span className="text-sm text-muted-foreground">
                    {submitState.message}
                  </span>
                )}
                {submitState.state === "error" && (
                  <span className="text-sm text-destructive">
                    {submitState.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {preview && preview.headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Showing up to the first three rows from{" "}
              {preview.fileName ?? "the uploaded file"}.
              {selectedTable && (
                <span className="block mt-1 text-muted-foreground">
                  Use the mapping row below to connect CSV columns to{" "}
                  <span className="font-medium text-foreground">
                    {selectedTable.label}
                  </span>{" "}
                  fields.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-6xl">
            <Table>
              <TableHeader>
                <TableRow>
                  {preview.headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTable && (
                  <MappingRow
                    columnMapping={columnMapping}
                    csvHeaders={preview.headers}
                    onMappingChange={handleMappingChange}
                    tableColumns={selectedTable.columns}
                  />
                )}
                {preview.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={preview.headers.length}>
                      No data rows were detected in the CSV file.
                    </TableCell>
                  </TableRow>
                ) : (
                  preview.rows.map((row, rowIndex) => (
                    <TableRow key={`${preview.fileId}-${rowIndex}`}>
                      {preview.headers.map((_, columnIndex) => (
                        <TableCell
                          key={`${preview.fileId}-${rowIndex}-${columnIndex}`}
                        >
                          {row[columnIndex] ?? ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function buildInitialMapping(columns: CsvImportColumn[], headers: string[]) {
  const headerLookup = new Map<string, string>();
  for (const header of headers) {
    headerLookup.set(normalizeHeader(header), header);
  }

  const mapping: Record<string, string | null> = {};

  for (const column of columns) {
    const headerMatch =
      headerLookup.get(normalizeHeader(column.label)) ??
      headerLookup.get(normalizeHeader(column.key));

    mapping[column.key] = headerMatch ?? null;
  }

  return mapping;
}

function MappingRow({
  csvHeaders,
  tableColumns,
  columnMapping,
  onMappingChange,
}: MappingRowProps) {
  // Reverse mapping: for each CSV header, find which table column it's mapped to
  const headerToColumnMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const [columnKey, csvHeader] of Object.entries(columnMapping)) {
      if (csvHeader) {
        map.set(csvHeader, columnKey);
      }
    }
    return map;
  }, [columnMapping]);

  return (
    <>
      {/* Label row */}
      <TableRow className="bg-muted/30 border-b-2 border-muted-foreground/20">
        <TableCell
          className="font-medium text-muted-foreground text-xs uppercase tracking-wide"
          colSpan={csvHeaders.length}
        >
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            <span>Map CSV columns to destination fields</span>
          </div>
        </TableCell>
      </TableRow>
      {/* Dropdown row */}
      <TableRow className="bg-muted/15">
        {csvHeaders.map((header) => {
          const mappedColumnKey = headerToColumnMap.get(header) ?? null;
          const mappedColumn = tableColumns.find(
            (c) => c.key === mappedColumnKey,
          );

          return (
            <TableCell className="p-2 min-w-[150px]" key={header}>
              <Select
                onValueChange={(value) => onMappingChange(header, value)}
                value={mappedColumnKey ?? OMIT_VALUE}
              >
                <SelectTrigger className="h-auto py-1 px-2 text-sm">
                  <SelectValue placeholder="Skip column">
                    {mappedColumn ? (
                      <div className="flex items-center gap-1.5">
                        <span>{mappedColumn.label}</span>
                        {mappedColumn.type && (
                          <Badge
                            className="text-[10px] px-1 h-4"
                            variant="secondary"
                          >
                            {mappedColumn.type}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Skip column</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OMIT_VALUE}>
                    <span className="text-muted-foreground">Skip column</span>
                  </SelectItem>
                  {tableColumns.map((column) => (
                    <SelectItem key={column.key} value={column.key}>
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.type && (
                          <Badge
                            className="text-[10px] px-1 h-4 ml-auto"
                            variant="outline"
                          >
                            {column.type}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
}

function normalizeHeader(value: string) {
  return value
    .replace(/\s+\(\d+\)$/u, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/giu, "");
}
