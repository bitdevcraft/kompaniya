"use client";

import { useEffect, useRef, useState } from "react";

import { env } from "@/env/client";

type CsvImportJob = {
  id: string;
  tableId: string;
  fileName: string | null;
  status: CsvImportJobStatus;
  totalRows: number | null;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  errorDetails: string | null;
  rowResults?: CsvImportRowResult[];
};

type CsvImportJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "partial_success";

type CsvImportRowResult = {
  id: string;
  rowNumber: number;
  status: "success" | "failed";
  rowData: string | null;
  errorMessage: string | null;
  errorField: string | null;
  recordId: string | null;
};

type UseJobSseOptions = {
  enabled?: boolean;
};

export function useJobSse(
  jobId: string | null | undefined,
  options: UseJobSseOptions = {},
) {
  const { enabled = true } = options;
  const [job, setJob] = useState<CsvImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Reset state when jobId is null or disabled
  useEffect(() => {
    if (!jobId || !enabled) {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      queueMicrotask(() => {
        setJob(null);
        setError(null);
      });
    }
  }, [jobId, enabled]);

  // Set up SSE connection when jobId is present
  useEffect(() => {
    if (!jobId || !enabled) return;

    // Close any existing connection before creating a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/csv-import/jobs/${jobId}/events`,
      {
        withCredentials: true,
      },
    );

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as CsvImportJob;
        setJob(data);
        setError(null);

        // Close connection if job is complete
        if (["completed", "failed", "partial_success"].includes(data.status)) {
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Connection error");
      eventSource.close();
      eventSourceRef.current = null;
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [jobId, enabled]);

  return { job, error };
}

export type { CsvImportJob, CsvImportJobStatus, CsvImportRowResult };
