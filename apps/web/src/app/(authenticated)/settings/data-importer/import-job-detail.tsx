"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@kompaniya/ui-common/components/alert";
import { Badge } from "@kompaniya/ui-common/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { useEffect, useState } from "react";

import { env } from "@/env/client";

import {
  type CsvImportJob,
  type CsvImportJobStatus,
  type CsvImportRowResult,
  useJobSse,
} from "./use-job-sse";

type FailedRowsResponse = {
  rows: CsvImportRowResult[];
  total: number;
};

const statusConfig: Record<
  CsvImportJobStatus,
  {
    label: string;
    icon: typeof Clock;
    color: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  queued: { label: "Queued", icon: Clock, color: "secondary" },
  processing: { label: "Processing", icon: Clock, color: "default" },
  completed: { label: "Completed", icon: CheckCircle2, color: "default" },
  failed: { label: "Failed", icon: XCircle, color: "destructive" },
  partial_success: {
    label: "Partial Success",
    icon: AlertTriangle,
    color: "outline",
  },
};

interface ImportJobDetailProps {
  jobId: string;
  onBack?: () => void;
}

export function ImportJobDetail({ jobId }: ImportJobDetailProps) {
  const { job, error } = useJobSse(jobId);
  const [failedRowsData, setFailedRowsData] =
    useState<FailedRowsResponse | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Fetch failed rows when job is complete
  useEffect(() => {
    if (job && (job.failedRows ?? 0) > 0) {
      fetchFailedRows(jobId, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, job?.failedRows, page]);

  const fetchFailedRows = async (id: string, pageNum: number) => {
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/jobs/${id}/failed-rows?limit=${pageSize}&offset=${(pageNum - 1) * pageSize}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch failed rows");
      }

      const result = (await response.json()) as FailedRowsResponse;
      setFailedRowsData(result);
    } catch (err) {
      console.error("Failed to fetch failed rows:", err);
    }
  };

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return <div className="p-8 text-center">Loading job details...</div>;
  }

  return (
    <ImportJobDetailContent
      failedRowsData={failedRowsData}
      fetchFailedRows={fetchFailedRows}
      job={job}
      page={page}
      pageSize={pageSize}
      setPage={setPage}
    />
  );
}

export function ImportJobDetailContent({
  job,
  failedRowsData,
  page,
  setPage,
  pageSize,
  fetchFailedRows: _fetchFailedRows,
}: {
  job: CsvImportJob;
  failedRowsData: FailedRowsResponse | null;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  fetchFailedRows: (id: string, pageNum: number) => void;
}) {
  const config = statusConfig[job.status];
  const StatusIcon = config.icon;
  // Use totalRows if available, otherwise estimate based on processed rows for active jobs
  const displayTotalRows =
    job.totalRows ?? (job.status === "completed" ? job.processedRows : null);
  const progress = displayTotalRows
    ? Math.round((job.processedRows / displayTotalRows) * 100)
    : job.status === "processing" || job.status === "queued"
      ? 0
      : 100;

  return (
    <div className="space-y-6 p-6">
      {/* Job Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{job.fileName || "CSV Import"}</CardTitle>
              <CardDescription>
                {formatTableLabel(job.tableId)} - Created{" "}
                {new Date(job.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <Badge variant={config.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {job.processedRows} of {displayTotalRows ?? "unknown"} rows
              processed
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {displayTotalRows ?? "-"}
              </div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {job.successfulRows}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {job.failedRows}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{job.processedRows}</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </div>
          </div>

          {/* Error Message */}
          {job.errorMessage && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>{job.errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Failed Rows Table */}
      {(job.failedRows ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Failed Rows</CardTitle>
            <CardDescription>
              {job.failedRows} row{job.failedRows !== 1 ? "s" : ""} failed to
              import. Review errors below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!failedRowsData ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading failed rows...
              </div>
            ) : failedRowsData.rows.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No failed rows found.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Row #</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedRowsData.rows.map((row) => {
                      let rowData: Record<string, unknown> | null = null;
                      try {
                        rowData = row.rowData
                          ? (JSON.parse(row.rowData) as Record<string, unknown>)
                          : null;
                      } catch {
                        // Invalid JSON
                      }

                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono">
                            {row.rowNumber}
                          </TableCell>
                          <TableCell className="text-destructive max-w-md">
                            {row.errorMessage || "Unknown error"}
                          </TableCell>
                          <TableCell>
                            {row.errorField && (
                              <Badge variant="outline">{row.errorField}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-md">
                            {rowData ? (
                              <div
                                className="truncate"
                                title={JSON.stringify(rowData)}
                              >
                                {JSON.stringify(rowData)}
                              </div>
                            ) : (
                              row.rowData || "-"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {failedRowsData.total > pageSize && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      className="px-4 py-2 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-4">
                      Page {page} of{" "}
                      {Math.ceil(failedRowsData.total / pageSize)}
                    </span>
                    <button
                      className="px-4 py-2 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        page >= Math.ceil(failedRowsData.total / pageSize)
                      }
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Wrapper component for use in dialog - accepts only jobId
export function ImportJobDetailWrapper({ jobId }: { jobId: string }) {
  const { job, error } = useJobSse(jobId);
  const [failedRowsData, setFailedRowsData] =
    useState<FailedRowsResponse | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Fetch failed rows when job is complete
  useEffect(() => {
    if (job && (job.failedRows ?? 0) > 0) {
      fetchFailedRows(jobId, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, job?.failedRows, page]);

  const fetchFailedRows = async (id: string, pageNum: number) => {
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/jobs/${id}/failed-rows?limit=${pageSize}&offset=${(pageNum - 1) * pageSize}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch failed rows");
      }

      const result = (await response.json()) as FailedRowsResponse;
      setFailedRowsData(result);
    } catch (err) {
      console.error("Failed to fetch failed rows:", err);
    }
  };

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return <div className="p-8 text-center">Loading job details...</div>;
  }

  return (
    <ImportJobDetailContent
      failedRowsData={failedRowsData}
      fetchFailedRows={fetchFailedRows}
      job={job}
      page={page}
      pageSize={pageSize}
      setPage={setPage}
    />
  );
}

function formatTableLabel(tableId: string): string {
  return tableId
    .replace(/org([A-Z])/g, " $1")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
